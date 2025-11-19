package com.ssafy.yammy.ticket.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.match.entity.Scoreboard;
import com.ssafy.yammy.match.repository.ScoreboardRepository;
import com.ssafy.yammy.match.util.TeamNameMapper;
import com.ssafy.yammy.ticket.dto.TicketRequest;
import com.ssafy.yammy.ticket.dto.TicketResponse;
import com.ssafy.yammy.ticket.entity.Ticket;
import com.ssafy.yammy.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TicketService {

    private final TicketRepository ticketRepository;
    private final MemberRepository memberRepository;
    private final ScoreboardRepository scoreboardRepository;

    /**
     * 티켓 생성
     */
    @Transactional
    public TicketResponse createTicket(Long memberId, TicketRequest request, String photoUrl) {
        return createTicket(memberId, request, photoUrl, false);
    }

    /**
     * 티켓 생성 (NFT 발급 옵션 포함)
     */
    @Transactional
    public TicketResponse createTicket(Long memberId, TicketRequest request, String photoUrl, boolean mintNft) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // matchcode가 있으면 경기 데이터 자동 채우기
        String game = request.getGame();
        String location = request.getLocation();
        Integer awayScore = request.getAwayScore();
        Integer homeScore = request.getHomeScore();

        if (request.getMatchcode() != null && !request.getMatchcode().isEmpty()) {
            try {
                List<Scoreboard> scoreboards = scoreboardRepository.findByMatchcode(request.getMatchcode());
                if (!scoreboards.isEmpty()) {
                    Scoreboard firstScoreboard = scoreboards.get(0);

                    // 경기명 자동 채우기 (홈팀 vs 원정팀)
                    if (game == null || game.isEmpty()) {
                        game = firstScoreboard.getAway() + " vs " + firstScoreboard.getHome();
                    }

                    // 경기장 자동 채우기
                    if (location == null || location.isEmpty()) {
                        location = TeamNameMapper.normalizeStadiumName(firstScoreboard.getPlace());
                        // 정규화된 이름이 없으면 원본 사용
                        if (location == null || location.isEmpty()) {
                            location = firstScoreboard.getPlace();
                        }
                    }

                    // 점수 자동 채우기
                    for (Scoreboard sb : scoreboards) {
                        if (sb.getTeam().equals(firstScoreboard.getHome())) {
                            homeScore = sb.getRun();
                        } else if (sb.getTeam().equals(firstScoreboard.getAway())) {
                            awayScore = sb.getRun();
                        }
                    }

                    log.info("matchcode로 경기 데이터 자동 채움 - matchcode: {}, game: {}, location: {}",
                            request.getMatchcode(), game, location);
                }
            } catch (Exception e) {
                log.warn("matchcode로 경기 데이터 조회 실패 - matchcode: {}, error: {}",
                        request.getMatchcode(), e.getMessage());
            }
        }

        Ticket ticket = Ticket.builder()
                .member(member)
                .matchcode(request.getMatchcode())
                .game(game != null ? game : request.getGame())
                .date(request.getDate())
                .location(location != null ? location : request.getLocation())
                .seat(request.getSeat())
                .comment(request.getComment())
                .type(request.getType())
                .awayScore(awayScore)
                .homeScore(homeScore)
                .review(request.getReview())
                .photoUrl(photoUrl)
                .team(request.getTeam())
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("티켓 생성 완료 - ticketId: {}, memberId: {}, photoUrl: {}",
                savedTicket.getTicketId(), memberId, photoUrl);

        // NFT 발급 요청 시 처리
        if (mintNft && member.getWalletAddress() != null) {
            try {
                // NFT 발급 시에는 이미지 해시 없이 발급 (나중에 NFT 발급 버튼으로 발급)
                log.info("즉시 NFT 발급은 지원하지 않음 - ticketId: {}", savedTicket.getTicketId());
            } catch (Exception e) {
                log.error("NFT 발급 실패 (티켓은 생성됨) - ticketId: {}",
                        savedTicket.getTicketId(), e);
            }
        }

        return TicketResponse.from(savedTicket);
    }


    /**
     * 사용자의 티켓 목록 조회
     */
    public List<TicketResponse> getMyTickets(Long memberId) {
        List<Ticket> tickets = ticketRepository.findByMember_MemberIdOrderByCreatedAtDesc(memberId);
        return tickets.stream()
                .map(TicketResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 티켓 상세 조회
     */
    public TicketResponse getTicket(Long ticketId, Long memberId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("티켓을 찾을 수 없습니다."));

        // 본인 티켓만 조회 가능
        if (!ticket.getMember().getMemberId().equals(memberId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        return TicketResponse.from(ticket);
    }

    /**
     * 티켓 수정
     */
    @Transactional
    public TicketResponse updateTicket(Long ticketId, Long memberId, TicketRequest request, String photoUrl) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("티켓을 찾을 수 없습니다."));

        // 본인 티켓만 수정 가능
        if (!ticket.getMember().getMemberId().equals(memberId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        // matchcode가 있으면 경기 데이터 자동 채우기
        String game = request.getGame();
        String location = request.getLocation();
        Integer awayScore = request.getAwayScore();
        Integer homeScore = request.getHomeScore();

        if (request.getMatchcode() != null && !request.getMatchcode().isEmpty()) {
            try {
                List<Scoreboard> scoreboards = scoreboardRepository.findByMatchcode(request.getMatchcode());
                if (!scoreboards.isEmpty()) {
                    Scoreboard firstScoreboard = scoreboards.get(0);

                    // 경기명 자동 채우기 (홈팀 vs 원정팀)
                    if (game == null || game.isEmpty()) {
                        game = firstScoreboard.getAway() + " vs " + firstScoreboard.getHome();
                    }

                    // 경기장 자동 채우기
                    if (location == null || location.isEmpty()) {
                        location = TeamNameMapper.normalizeStadiumName(firstScoreboard.getPlace());
                        // 정규화된 이름이 없으면 원본 사용
                        if (location == null || location.isEmpty()) {
                            location = firstScoreboard.getPlace();
                        }
                    }

                    // 점수 자동 채우기
                    for (Scoreboard sb : scoreboards) {
                        if (sb.getTeam().equals(firstScoreboard.getHome())) {
                            homeScore = sb.getRun();
                        } else if (sb.getTeam().equals(firstScoreboard.getAway())) {
                            awayScore = sb.getRun();
                        }
                    }

                    log.info("matchcode로 경기 데이터 자동 채움 - matchcode: {}, game: {}, location: {}",
                            request.getMatchcode(), game, location);
                }
            } catch (Exception e) {
                log.warn("matchcode로 경기 데이터 조회 실패 - matchcode: {}, error: {}",
                        request.getMatchcode(), e.getMessage());
            }
        }

        ticket.update(
                game != null ? game : request.getGame(),
                request.getDate(),
                location != null ? location : request.getLocation(),
                request.getSeat(),
                request.getComment(),
                request.getType(),
                awayScore,
                homeScore,
                request.getReview(),
                photoUrl,
                request.getMatchcode(),
                request.getTeam()
        );

        log.info("티켓 수정 완료 - ticketId: {}, memberId: {}", ticketId, memberId);

        return TicketResponse.from(ticket);
    }

    /**
     * 티켓 삭제
     */
    @Transactional
    public void deleteTicket(Long ticketId, Long memberId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("티켓을 찾을 수 없습니다."));

        // 본인 티켓만 삭제 가능
        if (!ticket.getMember().getMemberId().equals(memberId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        ticketRepository.delete(ticket);
        log.info("티켓 삭제 완료 - ticketId: {}, memberId: {}", ticketId, memberId);
    }
}

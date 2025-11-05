package com.ssafy.yammy.ticket.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
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

    /**
     * 티켓 생성
     */
    @Transactional
    public TicketResponse createTicket(Long memberId, TicketRequest request, String photoUrl) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Ticket ticket = Ticket.builder()
                .member(member)
                .matchcode(request.getMatchcode())
                .game(request.getGame())
                .date(request.getDate())
                .location(request.getLocation())
                .seat(request.getSeat())
                .comment(request.getComment())
                .type(request.getType())
                .awayScore(request.getAwayScore())
                .homeScore(request.getHomeScore())
                .review(request.getReview())
                .photoUrl(photoUrl)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("티켓 생성 완료 - ticketId: {}, memberId: {}", savedTicket.getTicketId(), memberId);

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

        ticket.update(
                request.getGame(),
                request.getDate(),
                request.getLocation(),
                request.getSeat(),
                request.getComment(),
                request.getType(),
                request.getAwayScore(),
                request.getHomeScore(),
                request.getReview(),
                photoUrl,
                request.getMatchcode()
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

package com.ssafy.yammy.match.service;

import com.ssafy.yammy.match.dto.MatchResponse;
import com.ssafy.yammy.match.entity.GameInfo;
import com.ssafy.yammy.match.entity.MatchSchedule;
import com.ssafy.yammy.match.entity.Scoreboard;
import com.ssafy.yammy.match.repository.GameInfoRepository;
import com.ssafy.yammy.match.repository.MatchScheduleRepository;
import com.ssafy.yammy.match.repository.ScoreboardRepository;
import com.ssafy.yammy.match.util.TeamNameMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchService {

    private final ScoreboardRepository scoreboardRepository;
    private final MatchScheduleRepository matchScheduleRepository;
    private final GameInfoRepository gameInfoRepository;

    /**
     * 최근 경기 목록 조회 (페이징) - match_schedule 기반
     */
    public Page<MatchResponse> getRecentMatches(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MatchSchedule> schedules = matchScheduleRepository.findAll(
            PageRequest.of(page, size, org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "matchDate"
            ))
        );

        return schedules.map(schedule -> {
            // matchcode 생성: YYYYMMDD_gameid 형식
            String matchcode = schedule.getMatchDate().toString().replace("-", "") + "_" + schedule.getGameid();

            try {
                return getMatchDetail(matchcode);
            } catch (Exception e) {
                log.warn("경기 상세 정보 조회 실패 - matchcode: {}, 스케줄 정보로 대체", matchcode);
                // 약자를 풀네임으로 변환
                String homeFullName = TeamNameMapper.codeToFullName(schedule.getHome());
                String awayFullName = TeamNameMapper.codeToFullName(schedule.getAway());

                // 스케줄 정보만이라도 반환
                return MatchResponse.builder()
                    .matchcode(matchcode)
                    .matchdate(schedule.getMatchDate())
                    .home(homeFullName)
                    .away(awayFullName)
                    .matchStatus(schedule.getMatchStatus())
                    .build();
            }
        });
    }

    /**
     * 특정 경기 상세 조회
     */
    public MatchResponse getMatchDetail(String matchcode) {
        List<Scoreboard> scoreboards = scoreboardRepository.findByMatchcode(matchcode);

        if (scoreboards.isEmpty()) {
            throw new RuntimeException("경기를 찾을 수 없습니다: " + matchcode);
        }

        // 첫 번째 레코드에서 기본 정보 추출
        Scoreboard firstRecord = scoreboards.get(0);

        // 각 팀별 이닝 득점 리스트 생성
        List<MatchResponse.InningScore> innings = scoreboards.stream()
                .map(this::convertToInningScore)
                .collect(Collectors.toList());

        // 홈/어웨이 스코어 계산
        Integer homeScore = null;
        Integer awayScore = null;

        for (Scoreboard sb : scoreboards) {
            if (sb.getTeam().equals(firstRecord.getHome())) {
                homeScore = sb.getRun();
            } else if (sb.getTeam().equals(firstRecord.getAway())) {
                awayScore = sb.getRun();
            }
        }

        return MatchResponse.builder()
                .matchcode(matchcode)
                .matchdate(firstRecord.getMatchdate())
                .home(firstRecord.getHome())
                .away(firstRecord.getAway())
                .place(firstRecord.getPlace())
                .homeScore(homeScore)
                .awayScore(awayScore)
                .gametime(firstRecord.getGametime())
                .audience(firstRecord.getAudience())
                .innings(innings)
                .build();
    }

    /**
     * 특정 날짜의 경기 목록 조회 - match_schedule 기반
     */
    public List<MatchResponse> getMatchesByDate(LocalDate date) {
        log.info("날짜별 경기 조회 시작 - date: {}", date);
        List<MatchSchedule> schedules = matchScheduleRepository.findByMatchDate(date);
        log.info("조회된 스케줄 수: {}", schedules.size());

        return schedules.stream()
                .map(schedule -> {
                    String matchcode = schedule.getMatchDate().toString().replace("-", "") + "_" + schedule.getGameid();
                    log.info("처리 중인 경기 - matchcode: {}, home: {}, away: {}",
                            matchcode, schedule.getHome(), schedule.getAway());

                    // 약자를 풀네임으로 변환 (기본값)
                    String homeFullName = TeamNameMapper.codeToFullName(schedule.getHome());
                    String awayFullName = TeamNameMapper.codeToFullName(schedule.getAway());

                    // scoreboard에서 추가 정보 조회 (선택적)
                    List<Scoreboard> scoreboards = scoreboardRepository.findByMatchcode(matchcode);

                    if (!scoreboards.isEmpty()) {
                        Scoreboard firstBoard = scoreboards.get(0);
                        Integer homeScore = null;
                        Integer awayScore = null;

                        for (Scoreboard sb : scoreboards) {
                            if (sb.getTeam().equals(firstBoard.getHome())) {
                                homeScore = sb.getRun();
                            } else if (sb.getTeam().equals(firstBoard.getAway())) {
                                awayScore = sb.getRun();
                            }
                        }

                        // 홈팀의 구장 조회
                        String stadium = TeamNameMapper.getHomeStadium(firstBoard.getHome());
                        // DB의 구장명이 있으면 정규화, 없으면 홈팀 구장 사용
                        String finalPlace = stadium;
                        if (firstBoard.getPlace() != null && !firstBoard.getPlace().isEmpty()) {
                            String normalized = TeamNameMapper.normalizeStadiumName(firstBoard.getPlace());
                            if (!normalized.isEmpty()) {
                                finalPlace = normalized;
                            }
                        }

                        return MatchResponse.builder()
                                .matchcode(matchcode)
                                .matchdate(schedule.getMatchDate())
                                .home(firstBoard.getHome())
                                .away(firstBoard.getAway())
                                .place(finalPlace)
                                .homeScore(homeScore)
                                .awayScore(awayScore)
                                .matchStatus(schedule.getMatchStatus())
                                .build();
                    } else {
                        // scoreboard에 데이터가 없으면 스케줄 정보만 반환
                        // 홈팀의 구장 조회
                        String stadium = TeamNameMapper.getHomeStadium(homeFullName);

                        return MatchResponse.builder()
                                .matchcode(matchcode)
                                .matchdate(schedule.getMatchDate())
                                .home(homeFullName)
                                .away(awayFullName)
                                .place(stadium)
                                .matchStatus(schedule.getMatchStatus())
                                .build();
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * 특정 팀의 최근 경기 조회
     */
    public Page<MatchResponse> getMatchesByTeam(String team, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Scoreboard> scoreboards = scoreboardRepository.findByTeam(team, pageable);

        return scoreboards.map(sb -> getMatchDetail(sb.getMatchcode()));
    }

    /**
     * 날짜 범위로 경기 조회
     */
    public Page<MatchResponse> getMatchesByDateRange(LocalDate startDate, LocalDate endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Scoreboard> scoreboards = scoreboardRepository.findByDateRange(startDate, endDate, pageable);

        return scoreboards.map(sb -> getMatchDetail(sb.getMatchcode()));
    }

    /**
     * 특정 날짜의 경기 스케줄 조회
     */
    public List<MatchSchedule> getScheduleByDate(LocalDate date) {
        return matchScheduleRepository.findByMatchDate(date);
    }

    /**
     * matchcode로 경기 정보 조회 (GameInfo 포함)
     */
    public GameInfo getGameInfo(String matchcode) {
        return gameInfoRepository.findByMatchcode(matchcode)
                .orElse(null);
    }

    /**
     * Scoreboard를 InningScore로 변환
     */
    private MatchResponse.InningScore convertToInningScore(Scoreboard sb) {
        List<Integer> scores = Arrays.asList(
                sb.getI1(), sb.getI2(), sb.getI3(), sb.getI4(), sb.getI5(),
                sb.getI6(), sb.getI7(), sb.getI8(), sb.getI9(), sb.getI10(),
                sb.getI11(), sb.getI12(), sb.getI13(), sb.getI14(), sb.getI15(),
                sb.getI16(), sb.getI17(), sb.getI18()
        );

        // null이 아닌 이닝만 필터링
        List<Integer> filteredScores = scores.stream()
                .filter(score -> score != null)
                .collect(Collectors.toList());

        return MatchResponse.InningScore.builder()
                .team(sb.getTeam())
                .scores(filteredScores)
                .run(sb.getRun())
                .hit(sb.getHit())
                .err(sb.getErr())
                .build();
    }
}

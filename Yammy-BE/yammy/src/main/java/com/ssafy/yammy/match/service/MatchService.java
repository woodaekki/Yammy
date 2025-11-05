package com.ssafy.yammy.match.service;

import com.ssafy.yammy.match.dto.MatchResponse;
import com.ssafy.yammy.match.entity.Scoreboard;
import com.ssafy.yammy.match.repository.ScoreboardRepository;
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

    /**
     * 최근 경기 목록 조회 (페이징)
     */
    public Page<MatchResponse> getRecentMatches(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Object[]> results = scoreboardRepository.findRecentMatches(pageable);

        return results.map(result -> {
            String matchcode = (String) result[0];
            return getMatchDetail(matchcode);
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
     * 특정 날짜의 경기 목록 조회
     */
    public List<MatchResponse> getMatchesByDate(LocalDate date) {
        List<Scoreboard> scoreboards = scoreboardRepository.findByMatchdate(date);

        // matchcode별로 그룹화
        return scoreboards.stream()
                .map(Scoreboard::getMatchcode)
                .distinct()
                .map(this::getMatchDetail)
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

package com.ssafy.yammy.predict.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.predict.dto.*;
import com.ssafy.yammy.predict.entity.PredictedMatches;
import com.ssafy.yammy.predict.entity.Predicted;
import com.ssafy.yammy.predict.entity.PredictMatchSchedule;
import com.ssafy.yammy.predict.repository.PredictedMatchesRepository;
import com.ssafy.yammy.predict.repository.PredictedRepository;
import com.ssafy.yammy.predict.repository.PredictMatchScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PredictService {

    private final PredictedRepository predictedRepository;
    private final PredictedMatchesRepository predictedMatchesRepository;
    private final PredictMatchScheduleRepository predictMatchScheduleRepository;
    private final MemberRepository memberRepository;

    /**
     * 배팅 생성
     */
    @Transactional
    public PredictedResponse createBetting(Member member, PredictedCreateRequest request) {
        final long MIN_BET_AMOUNT = 100L;
        if (request.getBatAmount() < MIN_BET_AMOUNT) {
            throw new IllegalArgumentException(String.format("최소 배팅 금액은 %d팬심입니다.", MIN_BET_AMOUNT));
        }

        PredictedMatches match = predictedMatchesRepository.findById(request.getPredictedMatchId())
                .orElseThrow(() -> {
                    log.error("Match not found: {}", request.getPredictedMatchId());
                    return new IllegalArgumentException("존재하지 않는 경기입니다.");
                });

        boolean alreadyBet = predictedRepository.existsByMemberAndPredictedMatch(member, match);
        if (alreadyBet) {
            log.warn("Duplicate betting attempt - User: {}, Match: {}", member.getNickname(), match.getId());
            throw new IllegalStateException("이미 이 경기에 배팅하셨습니다. 한 경기당 한 번만 배팅 가능합니다.");
        }

        if (member.getExp() < request.getBatAmount()) {
            throw new IllegalStateException("팬심이 부족합니다.");
        }

        double odds = calculateOdds(match.getId(), request.getPredict());

        // 5. 배팅 생성 (paybackAmount는 정산시 계산)
        Predicted predicted = Predicted.builder()
                .member(member)
                .predictedMatch(match)
                .predict(request.getPredict())
                .batAmount(request.getBatAmount())
                .paybackAmount(0L)  // 정산 전이므로 0으로 설정
                .isSettled(0) // 정산 전
                .build();

        member.decreaseExp(request.getBatAmount());
        memberRepository.save(member);

        if (request.getPredict() == 0) {
            match.addHomeBetAmount(request.getBatAmount());
        } else {
            match.addAwayBetAmount(request.getBatAmount());
        }

        double newHomeOdds = calculateOddsFromEntity(match, 0);
        double newAwayOdds = calculateOddsFromEntity(match, 1);

        match.updateOdds(newHomeOdds, newAwayOdds);
        predictedMatchesRepository.save(match);

        Predicted savedPredicted = predictedRepository.save(predicted);
        return PredictedResponse.from(savedPredicted);
    }

    /**
     * 사용자의 배팅 내역 조회
     */
    public Page<PredictedResponse> getUserPredictions(Member member, Pageable pageable) {
        Page<Predicted> predictions = predictedRepository.findByMemberOrderByIdDesc(member, pageable);
        return predictions.map(PredictedResponse::from);
    }

    /**
     * 특정 경기의 배당률 계산 (메모리 기반)
     * @param predictedMatch 배팅 금액이 업데이트된 경기 엔티티
     * @param selectedTeam 선택된 팀 (0: 홈팀, 1: 원정팀)
     */
    public double calculateOddsFromEntity(PredictedMatches predictedMatch, Integer selectedTeam) {
        try {
            // 1. 기본 배팅 금액: 각 팀에 1씩 + 현재 메모리의 배팅 금액
            long homeBetAmount = 1L + predictedMatch.getHomeAmount();
            long awayBetAmount = 1L + predictedMatch.getAwayAmount();
            
            // 2. 전체 배팅 금액
            long totalBetAmount = homeBetAmount + awayBetAmount;
            
            // 3. 선택된 팀의 배팅 금액
            long selectedTeamBetAmount = selectedTeam == 0 ? homeBetAmount : awayBetAmount;
            
            // 4. 배당률 계산: 전체 배팅금 / 선택팀 배팅금
            double calculatedOdds = (double) totalBetAmount / selectedTeamBetAmount;
            
            calculatedOdds = Math.max(1.01, calculatedOdds);
            return Math.round(calculatedOdds * 100.0) / 100.0;
        } catch (Exception e) {
            log.warn("Odds calculation error: {}", e.getMessage());
            return 2.0;
        }
    }

    /**
     * 특정 경기의 배당률 계산 (DB 쿼리 기반)
     * @param predictedMatchId predicted_matches 테이블의 PK
     * @param selectedTeam 선택된 팀 (0: 홈팀, 1: 원정팀)
     */
    public double calculateOdds(Long predictedMatchId, Integer selectedTeam) {
        try {
            // 1. 기본 배팅 금액: 각 팀에 1씩
            long homeBetAmount = 1L + predictedRepository.calculateHomeBetAmount(predictedMatchId);
            long awayBetAmount = 1L + predictedRepository.calculateAwayBetAmount(predictedMatchId);
            
            // 2. 전체 배팅 금액
            long totalBetAmount = homeBetAmount + awayBetAmount;
            
            // 3. 선택된 팀의 배팅 금액
            long selectedTeamBetAmount = selectedTeam == 0 ? homeBetAmount : awayBetAmount;
            
            // 4. 배당률 계산: 전체 배팅금 / 선택팀 배팅금
            double calculatedOdds = (double) totalBetAmount / selectedTeamBetAmount;
            
            calculatedOdds = Math.max(1.01, calculatedOdds);
            return Math.round(calculatedOdds * 100.0) / 100.0;
        } catch (Exception e) {
            log.warn("Odds calculation error: {}", e.getMessage());
            return 2.0;
        }
    }

    /**
     * 경기별 배당률 조회 (프론트엔드용)
     * @param matchScheduleId match_schedule 테이블의 ID
     */
    public MatchOddsResponse getMatchOdds(Long matchScheduleId) {
        PredictedMatches match = predictedMatchesRepository.findByMatchScheduleId(matchScheduleId)
                .orElseThrow(() -> {
                    log.error("Match odds query failed - ID: {}", matchScheduleId);
                    return new IllegalArgumentException("존재하지 않는 경기입니다.");
                });

        double homeOdds = calculateOdds(match.getId(), 0);
        double awayOdds = calculateOdds(match.getId(), 1);

        long homeBetAmount = 1L + predictedRepository.calculateHomeBetAmount(match.getId());
        long awayBetAmount = 1L + predictedRepository.calculateAwayBetAmount(match.getId());

        return MatchOddsResponse.of(matchScheduleId, match.getHome(), match.getAway(),
                homeOdds, awayOdds, homeBetAmount, awayBetAmount);
    }

    /**
     * 사용자 팬심 조회
     */
    public UserPointsResponse getUserPoints(Member member) {
        return UserPointsResponse.builder()
                .memberId(member.getMemberId())
                .nickname(member.getNickname())
                .points(member.getExp())
                .build();
    }

    /**
     * 전체 경기 조회 (predicted_matches 전체 조회 방식)
     */
    public List<MatchScheduleResponse> getMatchesByDate(String date) {
        List<PredictedMatches> matches = predictedMatchesRepository.findAll();

        if (matches.isEmpty()) {
            return List.of();
        }

        return matches.stream()
                .map(match -> {
                    Long predictedMatchId = match.getId();
                    Double homeOdds = match.getHomeOdds();
                    Double awayOdds = match.getAwayOdds();
                    Long homeAmount = match.getHomeAmount();
                    Long awayAmount = match.getAwayAmount();
                    Integer isSettled = match.getIsSettled();

                    return MatchScheduleResponse.from(match.getMatchSchedule(), predictedMatchId, homeOdds, awayOdds, homeAmount, awayAmount, isSettled);
                })
                .collect(Collectors.toList());
    }

    /**
     * 날짜 형식 변환 유틸리티 메서드
     * YYYYMMDD → YYYY-MM-DD 변환
     */
    private String formatDate(String date) {
        if (date == null || date.length() != 8) {
            return date;
        }

        try {
            String year = date.substring(0, 4);
            String month = date.substring(4, 6);
            String day = date.substring(6, 8);
            return year + "-" + month + "-" + day;
        } catch (Exception e) {
            log.warn("Date format conversion error: {}", date);
            return date;
        }
    }

    /**
     * match_schedule에 대응하는 predicted_match 조회 (스케줄러 의존 방식)
     * 생성 기능 제거 - 스케줄러에서만 생성
     */
    public PredictedMatches getPredictedMatch(PredictMatchSchedule schedule) {
        return predictedMatchesRepository.findByMatchScheduleId(schedule.getId())
            .orElseThrow(() -> {
                log.error("Betting info not ready - Schedule ID: {}, {} vs {}",
                         schedule.getId(), schedule.getHome(), schedule.getAway());
                return new IllegalStateException(
                    String.format("아직 당일 경기 배팅 정보가 준비되지 않았습니다. (%s vs %s)",
                                  schedule.getHome(), schedule.getAway())
                );
            });
    }

    /**
     * 스케줄러 수동 실행용 API (관리자/테스트용)
     */
    @Transactional
    public String recreatePredictedMatchesForDate(String targetDate) {
        try {
            log.info("Recreating predicted_matches for date: {}", targetDate);

            long predictedCount = predictedRepository.count();
            if (predictedCount > 0) {
                predictedRepository.deleteAllInBatch();
            }

            long predictedMatchesCount = predictedMatchesRepository.count();
            if (predictedMatchesCount > 0) {
                predictedMatchesRepository.deleteAllInBatch();
            }

            log.info("Data deletion completed - predicted: {}, predicted_matches: {}",
                    predictedCount, predictedMatchesCount);
            
            // 2. 지정된 날짜의 경기 조회
            List<PredictMatchSchedule> schedules = predictMatchScheduleRepository.findByMatchDate(targetDate);

            if (schedules.isEmpty()) {
                return String.format("No matches found for date: %s", targetDate);
            }

            log.info("Found {} matches for date: {}", schedules.size(), targetDate);

            int createdCount = 0;
            for (PredictMatchSchedule schedule : schedules) {
                try {
                    PredictedMatches newMatch = PredictedMatches.builder()
                            .matchSchedule(schedule)
                            .home(schedule.getHome())
                            .away(schedule.getAway())
                            .result(null)
                            .homeAmount(1L)
                            .awayAmount(1L)
                            .homeOdds(2.0)
                            .awayOdds(2.0)
                            .isSettled(0)
                            .build();

                    predictedMatchesRepository.save(newMatch);
                    createdCount++;

                } catch (Exception e) {
                    log.error("Match creation failed - ID: {}, Error: {}",
                            schedule.getId(), e.getMessage());
                }
            }

            String result = String.format("Completed - Deleted: predicted %d + predicted_matches %d, Created: %d/%d",
                                         predictedCount, predictedMatchesCount, createdCount, schedules.size());
            log.info(result);
            return result;

        } catch (Exception e) {
            String error = "Error during recreation: " + e.getMessage();
            log.error(error, e);
            throw new RuntimeException(error, e);
        }
    }

    /**
     * 관리자: 경기 정산
     */
    @Transactional
    public SettlementResponse settleMatches(List<SettlementRequest> requests) {
        log.info("Settlement started - {} matches", requests.size());

        int totalWinners = 0;
        long totalPayback = 0L;

        for (SettlementRequest request : requests) {
            PredictedMatches match = predictedMatchesRepository.findById(request.getMatchId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 경기입니다: " + request.getMatchId()));

            if (match.getIsSettled() == 1) {
                log.warn("Already settled - Match ID: {}", request.getMatchId());
                continue;
            }

            match.setResult(request.getResult());
            match.setIsSettled(1);
            predictedMatchesRepository.save(match);

            List<Predicted> bettings = predictedRepository.findByPredictedMatchId(request.getMatchId());

            for (Predicted betting : bettings) {
                if (betting.getIsSettled() == 1) {
                    continue;
                }

                boolean isWin = betting.getPredict().equals(request.getResult());

                if (isWin) {
                    double odds = (betting.getPredict() == 0) ? match.getHomeOdds() : match.getAwayOdds();
                    long payback = (long) (betting.getBatAmount() * odds);

                    betting.setPaybackAmount(payback);
                    betting.setIsSettled(1);

                    Member member = betting.getMember();
                    member.increaseExp(payback);
                    memberRepository.save(member);

                    totalWinners++;
                    totalPayback += payback;
                } else {
                    betting.setPaybackAmount(0L);
                    betting.setIsSettled(1);
                }

                predictedRepository.save(betting);
            }
        }

        log.info("Settlement completed - Matches: {}, Winners: {}, Total payback: {}",
                requests.size(), totalWinners, totalPayback);

        return SettlementResponse.builder()
                .settledMatchesCount(requests.size())
                .totalWinners(totalWinners)
                .totalPayback(totalPayback)
                .message("정산이 완료되었습니다.")
                .build();
    }
}

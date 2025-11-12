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
        log.info("배팅 생성 요청 - 사용자: {}, 경기: {}, 금액: {}", 
                member.getMemberId(), request.getPredictedMatchId(), request.getBatAmount());

        // 0. 최소 배팅 금액 검사
        final long MIN_BET_AMOUNT = 100L;
        if (request.getBatAmount() < MIN_BET_AMOUNT) {
            throw new IllegalArgumentException(String.format("최소 배팅 금액은 %d팬심입니다.", MIN_BET_AMOUNT));
        }

        // 1. 경기 존재 확인 (match_schedule ID로 predicted_matches 찾기)
        PredictedMatches match = predictedMatchesRepository.findByMatchScheduleId(request.getPredictedMatchId())
                .orElseThrow(() -> {
                    log.error("🚫 존재하지 않는 경기 ID: {}", request.getPredictedMatchId());
                    return new IllegalArgumentException("존재하지 않는 경기입니다.");
                });
        
        log.info("🏈 경기 발견 - predicted_matches ID: {}, match_schedule ID: {}, {} vs {}", 
                match.getId(), request.getPredictedMatchId(), match.getHome(), match.getAway());

        // 2. 사용자 팬심 확인
        if (member.getExp() < request.getBatAmount()) {
            throw new IllegalStateException("팬심이 부족합니다.");
        }

        // 3. 배당률 계산 (참고용 - 정산시 재계산됨)
        double odds = calculateOdds(match.getId(), request.getPredict());
        log.info("현재 배당률: {}", odds);

        // 4. 배팅 생성 (paybackAmount는 정산시 계산)
        Predicted predicted = Predicted.builder()
                .member(member)
                .predictedMatch(match)
                .predict(request.getPredict())
                .batAmount(request.getBatAmount())
                .paybackAmount(0L)  // 정산 전이므로 0으로 설정
                .isSettled(0) // 정산 전
                .build();

        // 5. 팬심 차감
        member.decreaseExp(request.getBatAmount());
        memberRepository.save(member);

        // 6. 경기의 배팅 금액 업데이트
        log.info("🎯 배팅 금액 업데이트 전 - 홈: {}, 원정: {}", match.getHomeAmount(), match.getAwayAmount());
        
        if (request.getPredict() == 0) {
            match.addHomeBetAmount(request.getBatAmount());
            log.info("홈팀에 {}팬심 배팅 추가", request.getBatAmount());
        } else {
            match.addAwayBetAmount(request.getBatAmount());
            log.info("원정팀에 {}팬심 배팅 추가", request.getBatAmount());
        }
        
        log.info("🎯 배팅 금액 업데이트 후 - 홈: {}, 원정: {}", match.getHomeAmount(), match.getAwayAmount());
        
        // 7. 새로운 배당률 계산 및 업데이트 (메모리 기반)
        double newHomeOdds = calculateOddsFromEntity(match, 0);
        double newAwayOdds = calculateOddsFromEntity(match, 1);
        
        log.info("📊 배당률 업데이트 - 경기 ID: {}, 기존 홈: {} → 신규 홈: {}, 기존 원정: {} → 신규 원정: {}",
                match.getId(), match.getHomeOdds(), newHomeOdds, match.getAwayOdds(), newAwayOdds);
        
        match.updateOdds(newHomeOdds, newAwayOdds);
        predictedMatchesRepository.save(match);

        // 8. 배팅 저장
        Predicted savedPredicted = predictedRepository.save(predicted);

        log.info("🎉 배팅 생성 완료 - 배팅 ID: {}, 현재 배당률: {} (정산시 재계산)", savedPredicted.getId(), odds);
        return PredictedResponse.from(savedPredicted);
    }

    /**
     * 사용자의 배팅 내역 조회
     */
    public Page<PredictedResponse> getUserPredictions(Member member, Pageable pageable) {
        log.info("사용자 배팅 내역 조회 - 사용자: {}", member.getId());
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
            
            // 5. 최소 배당률 제한 (1.01 이상)
            calculatedOdds = Math.max(1.01, calculatedOdds);
            
            log.debug("배당률 계산 (메모리 기반) - 경기 ID: {}, 선택팀: {}, 홈배팅: {}, 원정배팅: {}, 총배팅: {}, 최종배당률: {}", 
                    predictedMatch.getId(), selectedTeam, homeBetAmount, awayBetAmount, totalBetAmount, calculatedOdds);
            
            return Math.round(calculatedOdds * 100.0) / 100.0; // 소수점 2자리 반올림
            
        } catch (Exception e) {
            log.warn("배당률 계산 오류, 기본값 사용: {}", e.getMessage());
            return 2.0; // 오류 시 기본 배당률
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
            
            // 5. 최소 배당률 제한 (1.01 이상)
            calculatedOdds = Math.max(1.01, calculatedOdds);
            
            log.debug("배당률 계산 (DB 기반) - predicted_match ID: {}, 선택팀: {}, 홈배팅: {}, 원정배팅: {}, 총배팅: {}, 최종배당률: {}", 
                    predictedMatchId, selectedTeam, homeBetAmount, awayBetAmount, totalBetAmount, calculatedOdds);
            
            return Math.round(calculatedOdds * 100.0) / 100.0; // 소수점 2자리 반올림
            
        } catch (Exception e) {
            log.warn("배당률 계산 오류, 기본값 사용: {}", e.getMessage());
            return 2.0; // 오류 시 기본 배당률
        }
    }

    /**
     * 경기별 배당률 조회 (프론트엔드용)
     * @param matchScheduleId match_schedule 테이블의 ID
     */
    public MatchOddsResponse getMatchOdds(Long matchScheduleId) {
        // match_schedule ID로 predicted_matches 찾기
        PredictedMatches match = predictedMatchesRepository.findByMatchScheduleId(matchScheduleId)
                .orElseThrow(() -> {
                    log.error("🚫 배당률 조회 실패 - match_schedule ID: {}", matchScheduleId);
                    return new IllegalArgumentException("존재하지 않는 경기입니다.");
                });
                
        // predicted_matches의 PK로 배당률 계산
        double homeOdds = calculateOdds(match.getId(), 0);
        double awayOdds = calculateOdds(match.getId(), 1);
        
        // predicted_matches의 PK로 배팅 금액 조회
        long homeBetAmount = 1L + predictedRepository.calculateHomeBetAmount(match.getId());
        long awayBetAmount = 1L + predictedRepository.calculateAwayBetAmount(match.getId());
        
        return MatchOddsResponse.of(matchScheduleId, match.getHome(), match.getAway(),
                homeOdds, awayOdds, homeBetAmount, awayBetAmount);
    }

    /**
     * 사용자 팬심 조회
     */
    public UserPointsResponse getUserPoints(Member member) {
        log.info("사용자 팬심 조회 - 사용자: {}", member.getId());
        return UserPointsResponse.builder()
                .memberId(member.getMemberId())
                .nickname(member.getNickname())
                .points(member.getExp())
                .build();
    }

    /**
     * 날짜별 경기 조회 (predicted_matches 직접 조회 방식)
     */
    public List<MatchScheduleResponse> getMatchesByDate(String date) {
        log.info("경기 조회 요청 - 날짜: {}", date);
        
        // 날짜 형식 변환 (YYYYMMDD → YYYY-MM-DD)
        String formattedDate = formatDate(date);
        log.info("날짜 형식 변환: {} → {}", date, formattedDate);
        
        // predicted_matches 테이블에서 직접 조회 (성능 개선)
        List<PredictedMatches> matches = predictedMatchesRepository.findByMatchDate(formattedDate);
        
        if (matches.isEmpty()) {
            log.warn("⚠️ 지정된 날짜({})에 배팅 가능한 경기가 없습니다.", formattedDate);
            return List.of(); // 빈 리스트 반환
        }
        
        log.info("📊 {}개의 배팅 가능 경기 발견 - 날짜: {}", matches.size(), formattedDate);
        
        return matches.stream()
                .map(match -> {
                    // predicted_matches에서 직접 배당률 및 배팅금액 조회
                    Double homeOdds = match.getHomeOdds();
                    Double awayOdds = match.getAwayOdds();
                    Long homeAmount = match.getHomeAmount();
                    Long awayAmount = match.getAwayAmount();
                    
                    log.debug("📊 경기 정보 - matchId: {}, 홈: {} ({}, {}팬심) vs 원정: {} ({}, {}팬심)", 
                            match.getMatchSchedule().getId(), match.getHome(), homeOdds, homeAmount, 
                            match.getAway(), awayOdds, awayAmount);
                    
                    return MatchScheduleResponse.from(match.getMatchSchedule(), homeOdds, awayOdds, homeAmount, awayAmount);
                })
                .collect(Collectors.toList());
    }

    /**
     * 날짜 형식 변환 유틸리티 메서드
     * YYYYMMDD → YYYY-MM-DD 변환
     */
    private String formatDate(String date) {
        if (date == null || date.length() != 8) {
            return date; // 이미 올바른 형식이거나 잘못된 형식인 경우 그대로 반환
        }
        
        // YYYYMMDD → YYYY-MM-DD 변환
        try {
            String year = date.substring(0, 4);
            String month = date.substring(4, 6);
            String day = date.substring(6, 8);
            return year + "-" + month + "-" + day;
        } catch (Exception e) {
            log.warn("날짜 형식 변환 실패: {}", date);
            return date; // 변환 실패시 원본 반환
        }
    }

    /**
     * match_schedule에 대응하는 predicted_match 조회 (스케줄러 의존 방식)
     * 생성 기능 제거 - 스케줄러에서만 생성
     */
    public PredictedMatches getPredictedMatch(PredictMatchSchedule schedule) {
        return predictedMatchesRepository.findByMatchScheduleId(schedule.getId())
            .orElseThrow(() -> {
                log.error("😫 배팅 정보가 준비되지 않은 경기 - scheduleId: {}, {} vs {}", 
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
            log.info("🔧 수동 실행 - predicted_matches 재생성 시작 - 날짜: {}", targetDate);
            
            // 1. 특정 날짜의 기존 데이터 삭제
            List<PredictedMatches> existingMatches = predictedMatchesRepository.findByMatchDate(targetDate);
            long deletedCount = existingMatches.size();
            
            if (deletedCount > 0) {
                log.info("🗑️ 기존 {}(날짜) 데이터 {}\uac1c 삭제 시작", targetDate, deletedCount);
                predictedMatchesRepository.deleteByMatchDate(targetDate);
                log.info("✅ 기존 데이터 삭제 완료");
            } else {
                log.info("📝 기존 {}(날짜) 데이터가 없음", targetDate);
            }
            
            // 2. 지정된 날짜의 경기 조회
            List<PredictMatchSchedule> schedules = predictMatchScheduleRepository.findByMatchDate(targetDate);
            
            if (schedules.isEmpty()) {
                return String.format("⚠️ 지정된 날짜(%s)에 경기가 없습니다.", targetDate);
            }
            
            log.info("🎾 {}(날짜) 경기 {}\uac1c 발견", targetDate, schedules.size());
            
            // 3. 경기 생성
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
                    
                    log.debug("✅ 경기 생성 성공 - ID: {}, {} vs {}", 
                             schedule.getId(), schedule.getHome(), schedule.getAway());
                    
                } catch (Exception e) {
                    log.error("❌ 경기 생성 실패 - match_schedule ID: {}, 오류: {}",
                            schedule.getId(), e.getMessage());
                }
            }
            
            String result = String.format("🎉 수동 실행 완료 - 삭제: %d개, 생성: %d/%d개", 
                                         deletedCount, createdCount, schedules.size());
            log.info(result);
            return result;
            
        } catch (Exception e) {
            String error = "💥 수동 실행 중 오류 발생: " + e.getMessage();
            log.error(error, e);
            throw new RuntimeException(error, e);
        }
    }
}

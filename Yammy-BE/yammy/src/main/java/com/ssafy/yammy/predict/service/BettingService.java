package com.ssafy.yammy.predict.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.payment.entity.Point;
import com.ssafy.yammy.payment.repository.PointRepository;
import com.ssafy.yammy.predict.dto.*;
import com.ssafy.yammy.predict.entity.Betting;
import com.ssafy.yammy.predict.entity.PredictMatchSchedule;
import com.ssafy.yammy.predict.repository.BettingRepository;
import com.ssafy.yammy.predict.repository.PredictMatchScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BettingService {

    private final BettingRepository bettingRepository;
    private final PredictMatchScheduleRepository matchScheduleRepository;
    private final PointRepository pointRepository;

    /**
     * 배팅 생성
     */
    @Transactional
    public BettingResponse createBetting(Member member, BettingCreateRequest request) {
        log.info("배팅 생성 요청 - 사용자: {}, 경기: {}, 금액: {}", 
                member.getMemberId(), request.getMatchId(), request.getBetAmount());

        // 0. 최소 배팅 금액 검사
        final long MIN_BET_AMOUNT = 100L;
        if (request.getBetAmount() < MIN_BET_AMOUNT) {
            throw new IllegalArgumentException(String.format("최소 배팅 금액은 %d팬심입니다.", MIN_BET_AMOUNT));
        }

        // 1. 경기 존재 확인
        PredictMatchSchedule match = matchScheduleRepository.findById(request.getMatchId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 경기입니다."));

        // 2. 사용자 포인트 확인 및 기본 포인트 생성
        Point userPoint = pointRepository.findByMember(member)
                .orElseGet(() -> {
                    // 포인트 정보가 없으면 기본 포인트로 생성 (테스트용 10,000팬심)
                    log.info("사용자 {} 포인트 초기화 - 기본 10,000팬심 지급", member.getMemberId());
                    Point newPoint = new Point();
                    newPoint.setMember(member);
                    newPoint.setBalance(10000L); // 기본 10,000팬심 지급
                    return pointRepository.save(newPoint);
                });

        if (userPoint.getBalance() < request.getBetAmount()) {
            throw new IllegalStateException("포인트가 부족합니다.");
        }

        // 3. 배당률 계산 (배팅 풀 기반)
        double odds = calculateOdds(match, request.getSelectedTeam());

        // 4. 배팅 생성
        Betting betting = Betting.builder()
                .member(member)
                .matchSchedule(match)
                .selectedTeam(request.getSelectedTeam())
                .betAmount(request.getBetAmount())
                .odds(odds)
                .expectedReturn(request.getExpectedReturn())
                .build();

        // 5. 포인트 차감
        userPoint.decrease(request.getBetAmount());
        pointRepository.save(userPoint);

        // 6. 배팅 저장
        Betting savedBetting = bettingRepository.save(betting);

        log.info("배팅 생성 완료 - ID: {}", savedBetting.getId());
        return BettingResponse.from(savedBetting);
    }

    /**
     * 사용자의 배팅 내역 조회
     */
    public Page<BettingResponse> getUserBettings(Member member, String status, Pageable pageable) {
        log.info("사용자 배팅 내역 조회 - 사용자: {}, 상태: {}", member.getId(), status);

        Page<Betting> bettings;
        
        if (status != null && !status.isEmpty()) {
            Betting.BettingStatus bettingStatus = Betting.BettingStatus.valueOf(status.toUpperCase());
            bettings = bettingRepository.findByMemberAndStatusOrderByCreatedAtDesc(member, bettingStatus, pageable);
        } else {
            bettings = bettingRepository.findByMemberOrderByCreatedAtDesc(member, pageable);
        }

        return bettings.map(BettingResponse::from);
    }

    /**
     * 사용자 포인트 조회
     */
    public UserPointsResponse getUserPoints(Member member) {
        log.info("사용자 포인트 조회 - 사용자: {}", member.getId());

        Point userPoint = pointRepository.findByMember(member)
                .orElseThrow(() -> new IllegalStateException("사용자 포인트 정보가 없습니다."));

        return UserPointsResponse.builder()
                .memberId(member.getMemberId())
                .points(userPoint.getBalance())
                .nickname(member.getNickname())
                .build();
    }

    /**
     * 배팅 취소
     */
    @Transactional
    public void cancelBetting(Member member, Long bettingId) {
        log.info("배팅 취소 요청 - 사용자: {}, 배팅 ID: {}", member.getId(), bettingId);

        // 1. 배팅 조회 및 소유권 확인
        Betting betting = bettingRepository.findByIdAndMember(bettingId, member)
                .orElseThrow(() -> new IllegalArgumentException("배팅을 찾을 수 없거나 권한이 없습니다."));

        // 2. 취소 가능 상태 확인
        if (!betting.isPending()) {
            throw new IllegalStateException("진행중인 배팅만 취소할 수 있습니다.");
        }

        // 3. 배팅 취소
        betting.cancel();

        // 4. 포인트 복구
        Point userPoint = pointRepository.findByMember(member)
                .orElseThrow(() -> new IllegalStateException("사용자 포인트 정보가 없습니다."));
        
        userPoint.increase(betting.getBetAmount());
        pointRepository.save(userPoint);

        // 5. 배팅 상태 저장
        bettingRepository.save(betting);

        log.info("배팅 취소 완료 - ID: {}", bettingId);
    }

    /**
     * 특정 경기와 팀에 대한 배당률 계산 (공개 메소드)
     * @param match 경기 정보
     * @param selectedTeam 선택된 팀 (0: 홈팀, 1: 원정팀)
     * @return 계산된 배당률
     */
    public Double calculateOddsForTeam(PredictMatchSchedule match, Integer selectedTeam) {
        return calculateOdds(match, selectedTeam);
    }

    /**
     * 배당률 계산 (배팅 풀 기반)
     * 양 팀에 배팅된 총 경험치를 기반으로 동적 배당률 계산
     */
    private double calculateOdds(PredictMatchSchedule match, Integer selectedTeam) {
        try {
            // 1. 해당 경기에 배팅된 총 경험치 조회 (기본 시드머니 포함)
            BettingPoolInfo poolInfo = getBettingPoolInfo(match.getId());
            
            // 2. 선택된 팀에 배팅된 경험치
            long selectedTeamBetAmount = selectedTeam == 0 ? 
                poolInfo.getHomeBetAmount() : poolInfo.getAwayBetAmount();
            
            // 3. 전체 배팅 경험치
            long totalBetAmount = poolInfo.getTotalBetAmount();
            
            // 4. 하우스 엣지 (10% 수수료)
            double houseEdge = 0.10;
            double payoutRate = 1.0 - houseEdge; // 90%를 배당으로 지급
            
            // 5. 배당률 계산: (전체 배팅금 * 지급률) / 선택팀 배팅금
            double calculatedOdds = (double) (totalBetAmount * payoutRate) / selectedTeamBetAmount;
            
            // 6. 최소/최대 배당률 제한
            calculatedOdds = Math.max(1.05, Math.min(10.0, calculatedOdds));
            
            log.info("배당률 계산 - 경기: {} vs {}, 선택팀: {}, 홈배팅: {}, 원정배팅: {}, 총배팅: {}, 최종배당률: {}", 
                    match.getHome(), match.getAway(), selectedTeam, 
                    poolInfo.getHomeBetAmount(), poolInfo.getAwayBetAmount(), 
                    totalBetAmount, calculatedOdds);
            
            return Math.round(calculatedOdds * 100.0) / 100.0; // 소수점 2자리 반올
            
        } catch (Exception e) {
            log.warn("배당률 계산 오류, 기본값 사용: {}", e.getMessage());
            return 2.0; // 오류 시 기본 배당률
        }
    }
    
    /**
     * 배팅 풀 정보 조회
     */
    private BettingPoolInfo getBettingPoolInfo(Long matchId) {
        // 1. 해당 경기의 모든 PENDING 상태 배팅 조회
        List<Betting> pendingBettings = bettingRepository.findPendingBettingsByMatchId(matchId);
        
        // 2. 기본 시드머니: 각 팀에 1 경험치씩
        long homeBetAmount = 1L;  // 홈팀 기본 시드
        long awayBetAmount = 1L;  // 원정팀 기본 시드
        
        // 3. 실제 배팅금을 기본 시드에 추가
        for (Betting betting : pendingBettings) {
            if (betting.getSelectedTeam() == 0) {
                homeBetAmount += betting.getBetAmount();
            } else {
                awayBetAmount += betting.getBetAmount();
            }
        }
        
        return BettingPoolInfo.builder()
                .homeBetAmount(homeBetAmount)
                .awayBetAmount(awayBetAmount)
                .totalBetAmount(homeBetAmount + awayBetAmount)
                .build();
    }
}

package com.ssafy.yammy.predict.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.predict.dto.*;
import com.ssafy.yammy.predict.entity.Predicted;
import com.ssafy.yammy.predict.entity.PredictedMatches;
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
    private final OpenAIService openAIService;

    // ===========================================
    // 배팅 생성
    // ===========================================
    @Transactional
    public PredictedResponse createBetting(Member member, PredictedCreateRequest request) {

        if (request.getBatAmount() < 100L) {
            throw new IllegalArgumentException("최소 배팅 금액은 100팬심입니다.");
        }

        PredictedMatches match = predictedMatchesRepository.findById(request.getPredictedMatchId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 경기입니다."));

        if (predictedRepository.existsByMemberAndPredictedMatch(member, match)) {
            throw new IllegalStateException("이미 배팅한 경기입니다.");
        }

        if (member.getExp() < request.getBatAmount()) {
            throw new IllegalStateException("팬심이 부족합니다.");
        }

        Predicted predicted = Predicted.builder()
                .member(member)
                .predictedMatch(match)
                .predict(request.getPredict())
                .batAmount(request.getBatAmount())
                .paybackAmount(0L)
                .isSettled(0)
                .build();

        member.decreaseExp(request.getBatAmount());
        memberRepository.save(member);

        if (request.getPredict() == 0)
            match.addHomeBetAmount(request.getBatAmount());
        else
            match.addAwayBetAmount(request.getBatAmount());

        match.updateOdds(
                calculateOddsFromEntity(match, 0),
                calculateOddsFromEntity(match, 1)
        );

        predictedMatchesRepository.save(match);
        Predicted saved = predictedRepository.save(predicted);

        return PredictedResponse.from(saved);
    }

    // ===========================================
    // 사용자 배팅/경기 조회 헬퍼
    // ===========================================
    public Page<PredictedResponse> getUserPredictions(Member member, Pageable pageable) {
        return predictedRepository.findByMemberOrderByIdDesc(member, pageable)
                .map(PredictedResponse::from);
    }

    public MatchOddsResponse getMatchOdds(Long predictedMatchId) {
        PredictedMatches match = predictedMatchesRepository.findById(predictedMatchId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 경기입니다."));

        return MatchOddsResponse.of(
                match.getId(),
                match.getHome(),
                match.getAway(),
                match.getHomeOdds(),
                match.getAwayOdds(),
                match.getHomeAmount(),
                match.getAwayAmount()
        );
    }

    public UserPointsResponse getUserPoints(Member member) {
        Member latest = memberRepository.findById(member.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return UserPointsResponse.builder()
                .memberId(latest.getMemberId())
                .nickname(latest.getNickname())
                .points(latest.getExp())
                .build();
    }

    public List<MatchScheduleResponse> getMatchesByDate(String date) {
        List<PredictedMatches> matches = predictedMatchesRepository.findByMatchDate(date);

        if (matches.isEmpty()) {
            return predictMatchScheduleRepository.findByMatchDate(date).stream()
                    .map(MatchScheduleResponse::from)
                    .collect(Collectors.toList());
        }

        return matches.stream()
                .map(pm -> MatchScheduleResponse.from(
                        pm.getMatchSchedule(),
                        pm.getId(),
                        pm.getHomeOdds(),
                        pm.getAwayOdds(),
                        pm.getHomeAmount(),
                        pm.getAwayAmount(),
                        pm.getIsSettled(),
                        pm.getAiPick()))
                .collect(Collectors.toList());
    }

    // ===========================================
    // 배당률 계산
    // ===========================================
    public double calculateOddsFromEntity(PredictedMatches match, Integer selectedTeam) {
        try {
            long home = 1 + match.getHomeAmount();
            long away = 1 + match.getAwayAmount();
            long total = home + away;
            long selected = (selectedTeam == 0 ? home : away);
            return Math.max(1.01, Math.round(((double) total / selected) * 100.0) / 100.0);
        } catch (Exception e) {
            return 2.0;
        }
    }

    public double calculateOdds(Long matchId, Integer selectedTeam) {
        try {
            long home = 1 + predictedRepository.calculateHomeBetAmount(matchId);
            long away = 1 + predictedRepository.calculateAwayBetAmount(matchId);
            long total = home + away;
            long selected = (selectedTeam == 0 ? home : away);
            return Math.max(1.01, Math.round(((double) total / selected) * 100.0) / 100.0);
        } catch (Exception e) {
            return 2.0;
        }
    }

    // ===========================================
    // 오늘 경기 생성 + AI PICK 수행
    // ===========================================
    @Transactional
    public String recreatePredictedMatchesForDate(String targetDate) {

        try {
            predictedRepository.deleteAllInBatch();
            predictedMatchesRepository.deleteAllInBatch();

            List<PredictMatchSchedule> schedules =
                    predictMatchScheduleRepository.findByMatchDate(targetDate);

            if (schedules.isEmpty()) return "해당 날짜 경기 없음";

            for (PredictMatchSchedule s : schedules) {
                PredictedMatches pm = PredictedMatches.builder()
                        .matchSchedule(s)
                        .home(s.getHome())
                        .away(s.getAway())
                        .result(null)
                        .homeAmount(1L)
                        .awayAmount(1L)
                        .homeOdds(2.0)
                        .awayOdds(2.0)
                        .isSettled(0)
                        .aiPick(null)
                        .build();

                predictedMatchesRepository.save(pm);
            }

            List<PredictedMatches> todayMatches =
                    predictedMatchesRepository.findByMatchDate(targetDate);

            if (todayMatches.isEmpty()) return "생성된 경기가 없음";

            List<AiPickResult> picks = openAIService.askMatchPicks(todayMatches);

            for (AiPickResult res : picks) {
                predictedMatchesRepository.findByHomeAndAway(res.getHome(), res.getAway())
                        .ifPresent(pm -> {
                            pm.setAiPick(res.getPick());
                            predictedMatchesRepository.save(pm);
                        });
            }

            return "AI PICK 생성 완료";

        } catch (Exception e) {
            throw new RuntimeException("오류 발생: " + e.getMessage(), e);
        }
    }

    // ===========================================
    // 정산 처리
    // ===========================================
    @Transactional
    public SettlementResponse settleMatches(List<SettlementRequest> requests) {

        int winners = 0;
        long totalPayback = 0L;

        for (SettlementRequest req : requests) {
            PredictedMatches match = predictedMatchesRepository.findById(req.getMatchId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 경기"));

            match.setResult(req.getResult());
            match.setIsSettled(1);
            predictedMatchesRepository.save(match);

            List<Predicted> bettings = predictedRepository.findByPredictedMatchId(req.getMatchId());

            for (Predicted b : bettings) {

                if (b.getIsSettled() == 1) continue;

                boolean isWin = b.getPredict().equals(req.getResult());

                if (isWin) {
                    double odds = (b.getPredict() == 0) ? match.getHomeOdds() : match.getAwayOdds();
                    long payback = (long) (b.getBatAmount() * odds);

                    b.setPaybackAmount(payback);
                    b.setIsSettled(1);

                    Member mem = b.getMember();
                    mem.increaseExp(payback);
                    memberRepository.save(mem);

                    winners++;
                    totalPayback += payback;

                } else {
                    b.setPaybackAmount(0L);
                    b.setIsSettled(1);
                }

                predictedRepository.save(b);
            }
        }

        return SettlementResponse.builder()
                .settledMatchesCount(requests.size())
                .totalWinners(winners)
                .totalPayback(totalPayback)
                .message("정산 완료")
                .build();
    }
}

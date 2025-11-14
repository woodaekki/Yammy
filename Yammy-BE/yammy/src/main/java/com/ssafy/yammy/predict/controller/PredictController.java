package com.ssafy.yammy.predict.controller;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.config.CustomUserDetails;
import com.ssafy.yammy.predict.dto.*;
import com.ssafy.yammy.predict.service.PredictService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/predict")
@RequiredArgsConstructor
@Tag(name = "Predict API", description = "야구 예측 및 배팅 관련 API")
public class PredictController {

    private final PredictService predictService;

    /**
     * 배팅 생성
     */
    @Operation(summary = "배팅 생성", description = "야구 경기에 대한 배팅을 생성합니다.")
    @PostMapping("/betting")
    public ResponseEntity<PredictedResponse> createBetting(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PredictedCreateRequest request) {

        if (userDetails == null) {
            log.error("Authentication failed - userDetails is null");
            throw new IllegalStateException("인증 정보가 없습니다.");
        }

        Member member = userDetails.getMember();
        if (member == null) {
            log.error("Member not found in userDetails");
            throw new IllegalStateException("사용자 정보를 찾을 수 없습니다.");
        }

        PredictedResponse response = predictService.createBetting(member, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 배팅 내역 조회
     */
    @Operation(summary = "사용자 배팅 내역 조회", description = "로그인한 사용자의 배팅 내역을 조회합니다.")
    @GetMapping("/my-bets")
    public ResponseEntity<Page<PredictedResponse>> getUserPredictions(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {

        Member member = userDetails.getMember();
        Page<PredictedResponse> predictions = predictService.getUserPredictions(member, pageable);
        return ResponseEntity.ok(predictions);
    }

    /**
     * 경기별 배당률 조회
     */
    @Operation(summary = "경기별 배당률 조회", description = "특정 경기의 배당률과 배팅 현황을 조회합니다.")
    @GetMapping("/odds/{predictedMatchId}")
    public ResponseEntity<MatchOddsResponse> getMatchOdds(@PathVariable Long predictedMatchId) {
        MatchOddsResponse response = predictService.getMatchOdds(predictedMatchId);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 팬심 조회
     */
    @Operation(summary = "사용자 팬심 조회", description = "로그인한 사용자의 팬심(경험치) 잔액을 조회합니다.")
    @GetMapping("/points")
    public ResponseEntity<UserPointsResponse> getUserPoints(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Member member = userDetails.getMember();
        UserPointsResponse response = predictService.getUserPoints(member);
        return ResponseEntity.ok(response);
    }

    /**
     * 당일 경기 조회 (프론트엔드 호환용)
     */
    @Operation(summary = "당일 경기 조회", description = "지정된 날짜의 야구 경기 일정을 조회합니다.")
    @GetMapping("/matches")
    public ResponseEntity<?> getMatches(@RequestParam String date) {
        try {
            List<MatchScheduleResponse> matches = predictService.getMatchesByDate(date);
            return ResponseEntity.ok(matches);
        } catch (Exception e) {
            log.error("Match query error: {}", e.getMessage());
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    /**
     * 관리자: 경기 정산
     */
    @Operation(summary = "경기 정산 (관리자)", description = "경기 결과를 입력하고 배팅을 정산합니다. 관리자만 사용 가능합니다.")
    @PostMapping("/admin/settle")
    public ResponseEntity<SettlementResponse> settleMatches(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody List<SettlementRequest> requests) {

        Member member = userDetails.getMember();

        if (!member.getAuthority().equals(Member.Authority.ADMIN)) {
            log.error("Unauthorized settlement attempt - User: {}, Authority: {}", member.getNickname(), member.getAuthority());
            throw new IllegalStateException("관리자 권한이 필요합니다.");
        }

        SettlementResponse response = predictService.settleMatches(requests);
        return ResponseEntity.ok(response);
    }
}

package com.ssafy.yammy.withdrawal.controller;

import com.ssafy.yammy.config.CustomUserDetails;
import com.ssafy.yammy.withdrawal.dto.WithdrawalRequest;
import com.ssafy.yammy.withdrawal.dto.WithdrawalResponse;
import com.ssafy.yammy.withdrawal.service.WithdrawalService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
@Tag(name = "Withdrawal API", description = "야미페이 환전 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/withdraw")
public class WithdrawalController {

    private final WithdrawalService withdrawalService;

    // 환전 요청
    @PostMapping("/request")
    public ResponseEntity<WithdrawalResponse> request(
            @AuthenticationPrincipal CustomUserDetails user, // memberid 자동 주입
            @RequestBody WithdrawalRequest dto)
    {
        Long memberId = user.getMemberId();
        WithdrawalResponse response = withdrawalService.requestWithdrawal(memberId, dto);
        return ResponseEntity.ok(response);
    }

    // 나의 환전 내역
    @GetMapping("/history")
    public ResponseEntity<List<WithdrawalResponse>> getHistory(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Long memberId = user.getMemberId();
        List<WithdrawalResponse> response = withdrawalService.getMyWithdrawals(memberId);
        return ResponseEntity.ok(response);
    }
}

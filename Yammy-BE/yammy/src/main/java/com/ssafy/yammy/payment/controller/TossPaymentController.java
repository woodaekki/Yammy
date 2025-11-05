package com.ssafy.yammy.payment.controller;

import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.config.JwtTokenProvider;
import com.ssafy.yammy.payment.dto.TossPaymentRequest;
import com.ssafy.yammy.payment.dto.TossPaymentResponse;
import com.ssafy.yammy.payment.service.TossPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Payment API", description = "얌 포인트 충전 API")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class TossPaymentController {

    private final TossPaymentService tosspaymentService;
    private final JwtTokenProvider jwtTokenProvider;

    @Operation(summary = "얌 포인트 전환 확인")
    @PostMapping("/confirm")
    public ResponseEntity<TossPaymentResponse> confirmPayment(HttpServletRequest request, @RequestBody TossPaymentRequest tossRequest) {
        Long memberId = extractMemberIdFromToken(request);
        // 토스 결제 승인 (테스트 키)
        TossPaymentResponse tossResponse = tosspaymentService.confirmPayment(tossRequest, memberId);
        return ResponseEntity.ok(tossResponse);
    }

    // 토큰 가져오기
    private Long extractMemberIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 토큰이 없습니다.");
        }
        String token = authHeader.substring(7);
        return jwtTokenProvider.getMemberId(token);
    }
}

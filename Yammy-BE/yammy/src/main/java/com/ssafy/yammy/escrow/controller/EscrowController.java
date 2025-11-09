package com.ssafy.yammy.escrow.controller;

import com.ssafy.yammy.config.CustomUserDetails;
import com.ssafy.yammy.escrow.dto.EscrowRequest;
import com.ssafy.yammy.escrow.dto.EscrowResponse;
import com.ssafy.yammy.escrow.service.EscrowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@Slf4j
@Tag(name = "Escrow", description = "야미페이 에스크로 API")
@RestController
@RequestMapping("/api/escrow")
@RequiredArgsConstructor
public class EscrowController {

    private final EscrowService escrowService;

    @Operation(summary = "채팅방 송금")
    @PostMapping("/{roomKey}")
    public ResponseEntity<EscrowResponse> deposit(
            @PathVariable String roomKey,
            @RequestBody EscrowRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {

        if (user == null) {
            log.error("인증된 사용자 정보가 없습니다!");
            throw new IllegalStateException("인증이 필요합니다.");
        }

        EscrowResponse response = escrowService.createEscrow(
                roomKey,
                user.getMemberId(),
                request.getAmount()
        );

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "거래 확정")
    @PostMapping("/{escrowId}/confirmed")
    public ResponseEntity<String> confirmed(
            @PathVariable Long escrowId,
            @AuthenticationPrincipal CustomUserDetails user) {

        if (user == null) {
            throw new IllegalStateException("인증이 필요합니다.");
        }

        escrowService.confirmedEscrow(escrowId);
        return ResponseEntity.ok("거래 완료: 포인트 지급 완료");
    }

    @Operation(summary = "거래 취소")
    @PostMapping("/{escrowId}/cancel")
    public ResponseEntity<String> cancel(
            @PathVariable Long escrowId,
            @AuthenticationPrincipal CustomUserDetails user) {

        if (user == null) {
            throw new IllegalStateException("인증이 필요합니다.");
        }

        escrowService.cancelEscrow(escrowId);
        return ResponseEntity.ok("거래 취소: 포인트 환불 완료");
    }
}
package com.ssafy.yammy.payment.controller;

import com.ssafy.yammy.config.JwtTokenProvider;
import com.ssafy.yammy.payment.dto.PointResponse;
import com.ssafy.yammy.payment.service.PointService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Point API", description = "얌 포인트 조회 API")
@RestController
@RequestMapping("/api/points")
@RequiredArgsConstructor
public class PointController {

    private final PointService pointService;
    private final JwtTokenProvider jwtTokenProvider;

    // 내 얌 포인트 조회
    @Operation(summary = "내 얌 포인트 조회")
    @GetMapping("/me")
    public ResponseEntity<PointResponse> getMyPoint(HttpServletRequest request) {
        Long memberId = extractMemberIdFromToken(request);
        PointResponse response = pointService.getMyPoint(memberId);
        return ResponseEntity.ok(response);
    }

    // 포인트 차감
    @Operation(summary = "얌 포인트 사용")
    @PostMapping("/use")
    public ResponseEntity<PointResponse> usePoint(HttpServletRequest request, @RequestParam Long amount) {
        Long memberId = extractMemberIdFromToken(request);
        PointResponse response = pointService.use(memberId, amount);
        return ResponseEntity.ok(response);
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

package com.ssafy.yammy.auth.controller;

import com.ssafy.yammy.auth.dto.*;
import com.ssafy.yammy.auth.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@Tag(name = "Auth API", description = "인증 관련 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 회원가입
    @Operation(summary = "회원가입")
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            log.info("회원가입 요청: id={}", request.getId());
            SignupResponse response = authService.signup(request);
            log.info("회원가입 성공: id={}", request.getId());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.warn("회원가입 실패: id={}, 이유={}", request.getId(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("회원가입 중 서버 오류: id={}", request.getId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "회원가입 처리 중 오류가 발생했습니다."));
        }
    }

    // 로그인
    @Operation(summary = "로그인")
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("로그인 요청: id={}", request.getId());
            LoginResponse response = authService.login(request);
            log.info("로그인 성공: id={}", request.getId());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("로그인 실패: id={}, 이유={}", request.getId(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("로그인 중 서버 오류: id={}", request.getId(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "로그인 중 오류가 발생했습니다."));
        }
    }

    // 로그아웃
    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestParam String id) {
        log.info("로그아웃 요청: id={}", id);
        authService.logout(id);
        log.info("로그아웃 성공: id={}", id);
        return ResponseEntity.ok().build();
    }

    // 새로운 AccessToken 발급
    @Operation(summary = "새로운 AccessToken 발급")
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
        @RequestHeader("Authorization") String authorizationHeader,
        @RequestHeader("X-Refresh-Token") String refreshToken
    ) {
        try {
            // Bearer 접두사 제거
            String accessToken = authorizationHeader.replace("Bearer ", "");
            log.info("새로운 토큰 발급 요청");
            String newAccessToken = authService.refresh(accessToken, refreshToken);
            log.info("새로운 토큰 발급 성공");
            return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
        } catch (IllegalArgumentException e) {
            log.warn("토큰 재발급 실패: 이유={}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("토큰 재발급 중 서버 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "토큰 재발급 처리 중 오류가 발생했습니다."));
        }
    }

    // 회원정보 수정
    @Operation(summary = "회원정보 수정")
    @PutMapping("/update")
    public ResponseEntity<?> updateMember(
        @AuthenticationPrincipal UserDetails user,
        @RequestBody MemberUpdateRequest request
    ) {
        try {
            log.info("회원정보 수정 요청: user={}", user.getUsername());
            MemberUpdateResponse response = authService.updateMember(user.getUsername(), request);
            log.info("회원정보 수정 성공: user={}", user.getUsername());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("회원정보 수정 실패: user={}, 이유={}", user.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("회원정보 수정 중 서버 오류: user={}", user.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "회원정보 수정 중 서버 오류가 발생했습니다."));
        }
    }

    // 비밀번호 변경
    @Operation(summary = "비밀번호 변경")
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
        @AuthenticationPrincipal UserDetails user,
        @Valid @RequestBody PasswordChangeRequest request
    ) {
        try {
            log.info("비밀번호 변경 요청: user={}", user.getUsername());
            authService.changePassword(user.getUsername(), request);
            log.info("비밀번호 변경 성공: user={}", user.getUsername());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("비밀번호 변경 실패: user={}, 이유={}", user.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("비밀번호 변경 중 서버 오류: user={}", user.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "비밀번호 변경 처리 중 오류가 발생했습니다."));
        }
    }

    // 회원탈퇴 (Soft Delete)
    @DeleteMapping("/delete")
    @Operation(summary = "회원탈퇴")
    public ResponseEntity<?> deleteMember(@AuthenticationPrincipal UserDetails user) {
        try {
            log.info("회원탈퇴 요청: user={}", user.getUsername());
            authService.deleteMember(user.getUsername());
            log.info("회원탈퇴 성공: user={}", user.getUsername());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("회원탈퇴 실패: user={}, 이유={}", user.getUsername(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("회원탈퇴 중 서버 오류: user={}", user.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "회원탈퇴 처리 중 오류가 발생했습니다."));
        }
    }
}

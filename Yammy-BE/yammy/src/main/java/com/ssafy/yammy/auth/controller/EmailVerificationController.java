package com.ssafy.yammy.auth.controller;

import java.util.Map;

import com.ssafy.yammy.auth.service.EmailVerificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Tag(name = "Email Verification API", description = "이메일 인증 API")
@RestController
@RequestMapping("/api/auth/email")
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    @Operation(summary = "이메일 인증 코드 발송")
    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestParam String email) {
        try {
            log.info("이메일 인증 요청: email={}", email);
            emailVerificationService.sendVerificationCode(email);
            log.info("인증 이메일 발송: email={}", email);
            return ResponseEntity.ok("인증 메일이 발송되었습니다.");
        } catch (IllegalArgumentException e) {
            log.warn("올바르지 않은 이메일 형식: email={}", email);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (org.springframework.mail.MailException e) {
            log.error("메일 서버 오류: email={}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "메일 서버 오류로 인증 메일을 발송하지 못했습니다. Gmail 설정을 확인해주세요."));
        } catch (Exception e) {
            log.error("이메일 인증 발송 중 서버 오류: email={}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "이메일 인증 처리 중 오류가 발생했습니다."));
        }
    }

    @Operation(summary = "이메일 인증 코드 검증")
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String email, @RequestParam String code) {
        try {
            log.info("이메일 인증 시도: email={}", email);
            boolean result = emailVerificationService.verifyCode(email, code);
            if (result) {
                log.info("이메일 인증 성공: email={}", email);
                return ResponseEntity.ok("인증 성공");
            } else {
                log.warn("이메일 인증 코드 불일치: email={}", email);
                return ResponseEntity.badRequest().body("인증 실패");
            }
        } catch (IllegalArgumentException e) {
            log.warn("이메일 인증 실패: email={}, 이유={}", email, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("이메일 인증 중 서버 오류: email={}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "이메일 인증 처리 중 오류가 발생했습니다."));
        }
    }
}

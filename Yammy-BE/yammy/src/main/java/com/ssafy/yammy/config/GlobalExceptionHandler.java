package com.ssafy.yammy.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * IllegalArgumentException 처리
     * - 주로 비즈니스 로직 검증 실패 시 발생
     * - 예: 탈퇴한 회원, 잘못된 입력값 등
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * IllegalStateException 처리
     * - 시스템 상태 오류 시 발생
     * - 예: 이메일 인증 미완료, 포인트 부족 등
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalStateException(IllegalStateException e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    /**
     * RuntimeException 처리
     * - 예상치 못한 런타임 오류 처리
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    /**
     * 모든 예외 처리 (최종 fallback)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}

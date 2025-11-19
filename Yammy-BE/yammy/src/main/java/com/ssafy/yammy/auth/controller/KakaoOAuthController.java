package com.ssafy.yammy.auth.controller;

import com.ssafy.yammy.auth.dto.LoginResponse;
import com.ssafy.yammy.auth.service.KakaoOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/oauth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class KakaoOAuthController {

    private final KakaoOAuthService kakaoOAuthService;

    /**
     * 카카오 로그인 콜백
     * GET /api/oauth/kakao?code={authorizationCode}
     */
    @GetMapping("/kakao")
    public ResponseEntity<LoginResponse> kakaoCallback(@RequestParam String code) {
        LoginResponse response = kakaoOAuthService.processKakaoLogin(code);
        return ResponseEntity.ok(response);
    }

    /**
     * 카카오 회원 탈퇴
     * POST /api/oauth/kakao/withdraw?code={authorizationCode}
     */
    @PostMapping("/kakao/withdraw")
    public ResponseEntity<Void> kakaoWithdraw(@RequestParam String code) {
        kakaoOAuthService.withdrawByKakaoCode(code);
        return ResponseEntity.ok().build();
    }
}

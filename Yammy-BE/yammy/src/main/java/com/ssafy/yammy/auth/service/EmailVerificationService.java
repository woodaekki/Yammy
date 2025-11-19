package com.ssafy.yammy.auth.service;

import lombok.RequiredArgsConstructor;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final StringRedisTemplate redisTemplate;
    private final EmailSenderService emailSenderService;

    private static final String PREFIX = "email:verify:";

    // 인증 코드 발송
    public void sendVerificationCode(String email) {
        String code = String.valueOf(new Random().nextInt(900000) + 100000); // 6자리
        redisTemplate.opsForValue().set(PREFIX + email, code, 5, TimeUnit.MINUTES);
        emailSenderService.sendEmail(email, "Yammy 이메일 인증 코드", "인증번호: " + code);
    }

    // 인증 코드 검증
    public boolean verifyCode(String email, String code) {
        String savedCode = redisTemplate.opsForValue().get(PREFIX + email);
        if (savedCode != null && savedCode.equals(code)) {
            redisTemplate.delete(PREFIX + email); // 한 번 쓰면 제거
            redisTemplate.opsForValue().set(PREFIX + email + ":verified", "true", 1, TimeUnit.HOURS);
            return true;
        }
        return false;
    }

    // 인증 여부 확인
    public boolean isVerified(String email) {
        String verified = redisTemplate.opsForValue().get(PREFIX + email + ":verified");
        return "true".equals(verified);
    }
}

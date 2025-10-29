package com.ssafy.yammy.auth.repository;

import java.time.Duration;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class RefreshTokenRepository {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String PREFIX = "refresh:";

    // Refresh Token 저장 (로그인 ID 기반)
    public void save(String loginId, String refreshToken, long expirationMillis) {
        redisTemplate.opsForValue().set(
            PREFIX + loginId,
            refreshToken,
            Duration.ofMillis(expirationMillis)
        );
    }

    // Refresh Token 조회 (로그인 ID 기반)
    public String findByLoginId(String loginId) {
        return redisTemplate.opsForValue().get(PREFIX + loginId);
    }

    // Refresh Token 삭제 (로그인 ID 기반)
    public void deleteByLoginId(String loginId) {
        redisTemplate.delete(PREFIX + loginId);
    }
}

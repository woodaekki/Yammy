package com.ssafy.yammy.config;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtTokenProvider {

    private final Key key;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtTokenProvider(
        @Value("${jwt.secretKey}") String secretKey,
        @Value("${jwt.accessExpiration}") long accessTokenExpiration,
        @Value("${jwt.refreshExpiration}") long refreshTokenExpiration
    ) {
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;

        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    // Access Token 생성 (로그인 ID 기반)
    public String createAccessToken(Long memberId, String loginId, String authority) {
        return createToken(memberId, loginId, authority, accessTokenExpiration);
    }

    // Refresh Token 생성 (로그인 ID 기반)
    public String createRefreshToken(Long memberId, String loginId, String authority) {
        return createToken(memberId, loginId, authority, refreshTokenExpiration);
    }

    private String createToken(Long memberId, String loginId, String authority, long expiration) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + expiration);

        return Jwts.builder()
            .setSubject(loginId)  // 로그인 ID를 subject로 설정
            .claim("authority", authority)  // ADMIN 또는 USER
            .claim("memberId", memberId)
            .setIssuedAt(now)
            .setExpiration(validity)
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    // JWT 토큰 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            log.warn("Invalid JWT: {}", e.getMessage());
            return false;
        }
    }

    // 토큰에서 로그인 ID 추출
    public String getLoginId(String token) {
        return getClaims(token).getSubject();
    }

    // 토큰에서 권한 추출
    public String getAuthority(String token) {
        return (String) getClaims(token).get("authority");
    }

    // 토큰에서 Member ID 추출
    public Long getMemberId(String token) {
        return ((Number) getClaims(token).get("memberId")).longValue();
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}

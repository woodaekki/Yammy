package com.ssafy.yammy.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.yammy.auth.dto.KakaoUser;
import com.ssafy.yammy.auth.dto.LoginResponse;
import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.auth.repository.RefreshTokenRepository;
import com.ssafy.yammy.config.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KakaoOAuthService {

    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final com.ssafy.yammy.payment.repository.PointRepository pointRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${jwt.refreshExpiration}")
    private long refreshExpiration;

    @Value("${kakao.rest.api.key}")
    private String restApiKey;

    @Value("${kakao.client-secret:}")
    private String clientSecret;

    @Value("${kakao.redirect-uri}")
    private String redirectUri;

    private static final String KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
    private static final String KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";
    private static final String KAKAO_UNLINK_URL = "https://kapi.kakao.com/v1/user/unlink";
    private static final String SOCIAL_DEFAULT_PASSWORD = "KAKAO_SOCIAL_LOGIN_USER";

    /**
     * 카카오 로그인 처리
     */
    @Transactional
    public LoginResponse processKakaoLogin(String code) {
        try {
            // 1. Authorization Code -> Access Token 교환
            String kakaoAccessToken = getAccessToken(code);

            // 2. Access Token으로 사용자 정보 조회
            KakaoUser kakaoUser = getUserInfo(kakaoAccessToken);

            // 3. 기존 사용자 확인 또는 신규 사용자 생성
            Member member = getOrCreateMember(kakaoUser);

            // 4. JWT 토큰 발급
            String accessToken = jwtTokenProvider.createAccessToken(
                member.getMemberId(),
                member.getId(),
                member.getAuthority().name()
            );
            String refreshToken = jwtTokenProvider.createRefreshToken(
                member.getMemberId(),
                member.getId(),
                member.getAuthority().name()
            );

            // Redis에 Refresh Token 저장 (로그인 ID 기반)
            refreshTokenRepository.save(member.getId(), refreshToken, refreshExpiration);

            // 5. 응답 반환
            return new LoginResponse(
                member.getMemberId(),
                member.getId(),
                member.getName(),
                member.getNickname(),
                member.getEmail(),
                member.getTeam(),
                member.getExp(),
                member.getAuthority().name(),
                accessToken,
                refreshToken
            );

        } catch (Exception e) {
            throw new RuntimeException("카카오 로그인 처리 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * Authorization Code를 Access Token으로 교환
     */
    private String getAccessToken(String code) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("client_id", restApiKey);
            // client_secret은 카카오 개발자 콘솔에서 활성화한 경우에만 전송
            if (clientSecret != null && !clientSecret.isEmpty()) {
                params.add("client_secret", clientSecret);
            }
            params.add("redirect_uri", redirectUri);
            params.add("code", code);

            // 디버깅용 로그
            System.out.println("=== 카카오 토큰 요청 정보 ===");
            System.out.println("client_id: " + restApiKey);
            System.out.println("client_secret: " + clientSecret);
            System.out.println("redirect_uri: " + redirectUri);
            System.out.println("code: " + code);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(KAKAO_TOKEN_URL, request, String.class);

            JsonNode node = objectMapper.readTree(response.getBody());
            return node.get("access_token").asText();

        } catch (Exception e) {
            throw new RuntimeException("카카오 액세스 토큰 발급 실패: " + e.getMessage(), e);
        }
    }

    /**
     * Access Token으로 사용자 정보 조회
     */
    private KakaoUser getUserInfo(String accessToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);

            HttpEntity<Void> request = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    KAKAO_USER_INFO_URL,
                    HttpMethod.GET,
                    request,
                    String.class
            );

            JsonNode node = objectMapper.readTree(response.getBody());
            Long id = node.get("id").asLong();
            String email = node.path("kakao_account").path("email").asText();
            String name = node.path("kakao_account").path("profile").path("nickname").asText();
            String profileImageUrl = node.path("kakao_account").path("profile").path("profile_image_url").asText();

            return new KakaoUser(id, email, name, profileImageUrl);

        } catch (Exception e) {
            throw new RuntimeException("카카오 사용자 정보 조회 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 기존 회원 조회 또는 신규 회원 생성
     */
    private Member getOrCreateMember(KakaoUser kakaoUser) {
        String kakaoId = String.valueOf(kakaoUser.getId());

        // 카카오 ID로 먼저 조회
        Optional<Member> existingMember = memberRepository.findByKakaoId(kakaoId);
        if (existingMember.isPresent()) {
            return existingMember.get();
        }

        // 이메일로 조회 (기존 일반 회원이 카카오로 로그인하는 경우)
        Optional<Member> memberByEmail = memberRepository.findByEmail(kakaoUser.getEmail());
        if (memberByEmail.isPresent()) {
            Member member = memberByEmail.get();
            // 카카오 정보 업데이트
            member.setKakaoId(kakaoId);
            member.setIsSocial(true);
            member.setProfileImage(kakaoUser.getProfileImageUrl());
            return memberRepository.save(member);
        }

        // 신규 회원 생성
        String encodedPassword = passwordEncoder.encode(SOCIAL_DEFAULT_PASSWORD);
        String uniqueId = generateUniqueId(kakaoUser.getName());

        Member newMember = Member.builder()
                .id(uniqueId)  // 고유한 로그인 ID 생성
                .name(kakaoUser.getName())
                .nickname(kakaoUser.getName())  // 초기값은 이름과 동일
                .email(kakaoUser.getEmail())
                .password(encodedPassword)
                .authority(Member.Authority.USER)
                .team("미정")
                .bio("카카오로 가입한 사용자입니다.")
                .emailVerified(true)  // 카카오 인증 완료로 간주
                .profileImage(kakaoUser.getProfileImageUrl())
                .isSocial(true)
                .kakaoId(kakaoId)
                .build();

        Member savedMember = memberRepository.save(newMember);

        // Point 계좌 자동 생성
        com.ssafy.yammy.payment.entity.Point point = new com.ssafy.yammy.payment.entity.Point();
        point.setMember(savedMember);
        point.setBalance(0L);
        point.setUpdatedAt(java.time.LocalDateTime.now());
        pointRepository.save(point);

        return savedMember;
    }

    /**
     * 고유한 로그인 ID 생성 (중복 방지)
     */
    private String generateUniqueId(String baseName) {
        String uniqueId;
        int attempt = 0;
        do {
            if (attempt == 0) {
                uniqueId = "kakao_" + baseName;
            } else {
                uniqueId = "kakao_" + baseName + "_" + UUID.randomUUID().toString().substring(0, 4);
            }
            attempt++;
        } while (memberRepository.existsById(uniqueId));

        return uniqueId;
    }

    /**
     * 카카오 회원 탈퇴
     */
    @Transactional
    public void withdrawByKakaoCode(String code) {
        try {
            // 1. Access Token 발급
            String accessToken = getAccessToken(code);

            // 2. 사용자 정보 조회
            KakaoUser kakaoUser = getUserInfo(accessToken);
            String kakaoId = String.valueOf(kakaoUser.getId());

            // 3. 카카오 연결 끊기
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders unlinkHeaders = new HttpHeaders();
            unlinkHeaders.setBearerAuth(accessToken);
            HttpEntity<Void> unlinkRequest = new HttpEntity<>(unlinkHeaders);

            restTemplate.exchange(KAKAO_UNLINK_URL, HttpMethod.POST, unlinkRequest, String.class);

            // 4. DB에서 사용자 삭제
            memberRepository.deleteByKakaoId(kakaoId);

        } catch (Exception e) {
            throw new RuntimeException("카카오 회원 탈퇴 처리 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
}

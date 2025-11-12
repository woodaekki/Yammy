package com.ssafy.yammy.auth.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ssafy.yammy.auth.dto.LoginRequest;
import com.ssafy.yammy.auth.dto.LoginResponse;
import com.ssafy.yammy.auth.dto.MemberInfoResponse;
import com.ssafy.yammy.auth.dto.MemberUpdateRequest;
import com.ssafy.yammy.auth.dto.MemberUpdateResponse;
import com.ssafy.yammy.auth.dto.PasswordChangeRequest;
import com.ssafy.yammy.auth.dto.SignupRequest;
import com.ssafy.yammy.auth.dto.SignupResponse;
import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.auth.repository.RefreshTokenRepository;
import com.ssafy.yammy.config.JwtTokenProvider;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final EmailVerificationService emailVerificationService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final com.ssafy.yammy.payment.repository.PointRepository pointRepository;

    @Value("${jwt.refreshExpiration}")
    private long refreshExpiration;

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        // 이메일 인증 여부 확인 (개발 단계에서는 비활성화)
        if (!emailVerificationService.isVerified(request.getEmail())) {
            throw new IllegalStateException("이메일 인증이 완료되지 않았습니다.");
        }

        // 중복 체크
        if (memberRepository.existsById(request.getId())) {
            throw new IllegalArgumentException("이미 존재하는 로그인 ID입니다.");
        }
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }
        if (memberRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 존재하는 닉네임입니다.");
        }

        Member member = Member.builder()
            .id(request.getId())  // 로그인 ID
            .password(passwordEncoder.encode(request.getPassword()))
            .name(request.getName())
            .nickname(request.getNickname())
            .email(request.getEmail())
            .team(request.getTeam())
            .gameTag(request.getGameTag() != null ? request.getGameTag() : 0L)
            .bio(request.getBio())
            .profileImage(request.getProfileImage())
            .authority(Member.Authority.USER)  // 기본값 USER
            .emailVerified(true)
            .exp(500L)  // 회원가입 시 500 팬심 지급
            .build();

        memberRepository.save(member);

        // Point 계좌 자동 생성
        com.ssafy.yammy.payment.entity.Point point = new com.ssafy.yammy.payment.entity.Point();
        point.setMember(member);
        point.setBalance(0L);
        point.setUpdatedAt(LocalDateTime.now());
        pointRepository.save(point);

        return new SignupResponse(
            member.getMemberId(),
            member.getId(),
            member.getEmail(),
            member.getName(),
            member.getNickname(),
            member.getAuthority()
        );
    }

    public LoginResponse login(LoginRequest loginRequest) {
        // 로그인 ID로 조회
        Member member = memberRepository.findById(loginRequest.getId())
            .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 ID입니다."));

        // 탈퇴 회원 체크 (Soft Delete)
        if (member.getDeletedAt() != null) {
            throw new IllegalArgumentException("탈퇴한 회원입니다.");
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(loginRequest.getPassword(), member.getPassword())) {
            throw new IllegalArgumentException("올바르지 않은 비밀번호입니다.");
        }

        // JWT 토큰 생성
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

        return new LoginResponse(
            member.getMemberId(),
            member.getId(),
            member.getName(),
            member.getNickname(),
            member.getEmail(),
            member.getTeam(),
            member.getExp(),
            member.getAuthority().name(),
            member.getProfileImage(),
            accessToken,
            refreshToken
        );
    }

    public void logout(String loginId) {
        refreshTokenRepository.deleteByLoginId(loginId);
    }

    public String refresh(String accessToken, String refreshToken) {
        // 만료된 Access Token에서 loginId 추출
        String loginId = jwtTokenProvider.getLoginIdFromExpiredToken(accessToken);
        log.info("토큰 갱신 시도: loginId={}", loginId);

        // Redis에서 저장된 Refresh Token 가져오기
        String savedToken = refreshTokenRepository.findByLoginId(loginId);
        log.info("Redis에서 조회한 토큰: {}", savedToken != null ? "존재함" : "없음");

        if (savedToken == null) {
            log.warn("Redis에 저장된 RefreshToken이 없습니다. loginId={}", loginId);
            throw new IllegalArgumentException("유효하지 않은 RefreshToken입니다.");
        }

        if (!savedToken.equals(refreshToken)) {
            log.warn("RefreshToken 불일치. loginId={}", loginId);
            log.debug("저장된 토큰: {}, 받은 토큰: {}", savedToken, refreshToken);
            throw new IllegalArgumentException("유효하지 않은 RefreshToken입니다.");
        }

        // Refresh Token이 만료되었는지 확인
        if (jwtTokenProvider.isTokenExpired(refreshToken)) {
            log.warn("RefreshToken이 만료됨. loginId={}", loginId);
            throw new IllegalArgumentException("RefreshToken이 만료되었습니다. 다시 로그인해주세요.");
        }

        // DB에서 유저 정보 가져오기
        Member member = memberRepository.findById(loginId)
            .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 ID입니다."));

        // 새 Access Token 생성
        log.info("새로운 AccessToken 생성 성공. loginId={}", loginId);
        return jwtTokenProvider.createAccessToken(
            member.getMemberId(),
            member.getId(),
            member.getAuthority().name()
        );
    }

    @Transactional
    public MemberUpdateResponse updateMember(String loginId, MemberUpdateRequest request) {
        Member member = memberRepository.findById(loginId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (request.getName() != null)
            member.setName(request.getName());
        if (request.getNickname() != null) {
            // 닉네임 중복 체크 (본인 제외)
            if (!member.getNickname().equals(request.getNickname()) &&
                memberRepository.existsByNickname(request.getNickname())) {
                throw new IllegalArgumentException("이미 존재하는 닉네임입니다.");
            }
            member.setNickname(request.getNickname());
        }
        if (request.getTeam() != null)
            member.setTeam(request.getTeam());
        if (request.getBio() != null)
            member.setBio(request.getBio());
        if (request.getProfileImage() != null)
            member.setProfileImage(request.getProfileImage());

        return new MemberUpdateResponse(
            member.getMemberId(),
            member.getId(),
            member.getName(),
            member.getNickname(),
            member.getEmail(),
            member.getTeam(),
            member.getBio(),
            member.getProfileImage(),
            member.getAuthority().name(),
            member.getUpdatedAt()
        );
    }

    @Transactional
    public void changePassword(String loginId, PasswordChangeRequest request) {
        Member member = memberRepository.findById(loginId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), member.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        member.setPassword(passwordEncoder.encode(request.getNewPassword()));
    }

    @Transactional
    public void deleteMember(String loginId) {
        Member member = memberRepository.findById(loginId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // Soft Delete: deletedAt에 현재 시각 설정
        member.setDeletedAt(LocalDateTime.now());

        // Refresh Token 삭제
        refreshTokenRepository.deleteByLoginId(loginId);
    }

    public MemberInfoResponse getMemberInfo(String loginId) {
        Member member = memberRepository.findById(loginId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        
        // 탈퇴 회원 체크 (Soft Delete)
        if (member.getDeletedAt() != null) {
            throw new IllegalArgumentException("탈퇴한 회원입니다.");
        }
        
        return MemberInfoResponse.from(member);
    }
}

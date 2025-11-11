package com.ssafy.yammy.config;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;

    public CustomUserDetailsService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
        log.info("🔍 [UserDetailsService] 로그인 ID로 사용자 조회: {}", loginId);
        
        // 로그인 ID로 회원 조회
        Member member = memberRepository.findById(loginId)
                .orElseThrow(() -> {
                    log.error("🚫 [UserDetailsService] 사용자 찾기 실패: {}", loginId);
                    return new UsernameNotFoundException("User not found with login ID: " + loginId);
                });

        log.info("🚀 [UserDetailsService] 사용자 발견: {} (memberId: {}, nickname: {})", 
                member.getId(), member.getMemberId(), member.getNickname());
        
        CustomUserDetails userDetails = new CustomUserDetails(member);
        log.info("🎉 [UserDetailsService] CustomUserDetails 생성 완료");
        
        return userDetails;
    }
}

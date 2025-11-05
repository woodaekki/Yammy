package com.ssafy.yammy.config;

import com.ssafy.yammy.auth.entity.Member;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {

    private final Member member;

    public CustomUserDetails(Member member) {
        this.member = member;
    }

    public Member getMember() {
        return member;
    }

    public Long getMemberId() {
        return member.getMemberId();
    }

    public String getName() {
        return member.getName();
    }

    public String getNickname() {
        return member.getNickname();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Member.Authority 을 ROLE 로 매핑
        return Collections.singleton(() -> "ROLE_" + member.getAuthority().name());
    }

    @Override
    public String getPassword() {
        return member.getPassword();
    }

    @Override
    public String getUsername() {
        // 로그인 ID 반환
        return member.getId();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // Soft Delete 처리: deletedAt이 null인 경우만 활성화
    @Override
    public boolean isEnabled() {
        return member.getDeletedAt() == null;
    }
}

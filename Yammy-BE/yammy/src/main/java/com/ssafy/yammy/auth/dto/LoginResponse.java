package com.ssafy.yammy.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {

    private Long memberId;
    private String id;  // 로그인 ID
    private String name;
    private String nickname;
    private String email;
    private String team;
    private Long exp;
    private String authority;  // ADMIN or USER
    private String accessToken;
    private String refreshToken;
}

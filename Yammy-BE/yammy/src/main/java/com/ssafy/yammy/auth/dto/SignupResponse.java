package com.ssafy.yammy.auth.dto;

import com.ssafy.yammy.auth.entity.Member;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SignupResponse {

    private Long memberId;
    private String id;  // 로그인 ID
    private String email;
    private String name;
    private String nickname;
    private Member.Authority authority;
}

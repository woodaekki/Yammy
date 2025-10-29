package com.ssafy.yammy.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {

    @NotBlank(message = "로그인 ID는 필수입니다")
    private String id;  // 로그인 ID

    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;

    @NotBlank(message = "이름은 필수입니다")
    private String name;

    @NotBlank(message = "닉네임은 필수입니다")
    private String nickname;

    @Email(message = "이메일 형식이 올바르지 않습니다")
    @NotBlank(message = "이메일은 필수입니다")
    private String email;

    @NotBlank(message = "팀은 필수입니다")
    private String team;  // 프로야구 팀

    private Long gameTag = 0L;  // 0: 요정, 1: 승요, 2: 패요

    private String bio;  // 소개

    private String profileImage;  // 프로필 이미지 URL

    private boolean emailVerified;  // 이메일 인증 여부
}

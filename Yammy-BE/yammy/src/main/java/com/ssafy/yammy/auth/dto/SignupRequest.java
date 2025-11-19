package com.ssafy.yammy.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {

    @NotBlank(message = "로그인 ID는 필수입니다")
    @Size(max = 20, message = "ID는 20자 이하로 입력해주세요")
    private String id;  // 로그인 ID

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 8, max = 30, message = "비밀번호는 8~30자 사이로 입력해주세요")
    private String password;

    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 20, message = "이름은 20자 이하로 입력해주세요")
    private String name;

    @NotBlank(message = "닉네임은 필수입니다")
    @Size(max = 20, message = "닉네임은 20자 이하로 입력해주세요")
    private String nickname;

    @Email(message = "이메일 형식이 올바르지 않습니다")
    @NotBlank(message = "이메일은 필수입니다")
    @Size(max = 50, message = "이메일은 50자 이하로 입력해주세요")
    private String email;

    @NotBlank(message = "팀은 필수입니다")
    private String team;  // 프로야구 팀

    private Long gameTag = 0L;  // 0: 요정, 1: 승요, 2: 패요

    @Size(max = 200, message = "자기소개는 200자 이하로 입력해주세요")
    private String bio;  // 소개

    private String profileImage;  // 프로필 이미지 URL

    private boolean emailVerified;  // 이메일 인증 여부
}

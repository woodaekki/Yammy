package com.ssafy.yammy.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "로그인 ID는 필수입니다")
    private String id;  // 로그인 ID

    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;
}

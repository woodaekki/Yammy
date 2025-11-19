package com.ssafy.yammy.auth.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberUpdateRequest {

    @Size(max = 20, message = "이름은 20자 이하로 입력해주세요")
    private String name;

    @Size(max = 20, message = "닉네임은 20자 이하로 입력해주세요")
    private String nickname;

    private String team;

    @Size(max = 200, message = "자기소개는 200자 이하로 입력해주세요")
    private String bio;

    private String profileImage;
}

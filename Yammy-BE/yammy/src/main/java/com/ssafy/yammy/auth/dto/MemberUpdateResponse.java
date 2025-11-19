package com.ssafy.yammy.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class MemberUpdateResponse {

    private Long memberId;
    private String id;  // 로그인 ID
    private String name;
    private String nickname;
    private String email;
    private String team;
    private String bio;
    private String profileImage;
    private String authority;
    private LocalDateTime updatedAt;
}

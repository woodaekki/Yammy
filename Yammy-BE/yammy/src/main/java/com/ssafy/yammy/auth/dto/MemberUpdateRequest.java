package com.ssafy.yammy.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberUpdateRequest {

    private String name;
    private String nickname;
    private String team;
    private String bio;
    private String profileImage;
}

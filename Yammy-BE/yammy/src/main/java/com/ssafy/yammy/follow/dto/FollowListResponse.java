package com.ssafy.yammy.follow.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FollowListResponse {
    private Long memberId;
    private String nickname;
    private String profileImage;
}

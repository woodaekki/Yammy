package com.ssafy.yammy.follow.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FollowListResponse {
    private Long memberId;
    private String nickname;
    private String profileImage;
    private String team;
    private Boolean isFollowing;  // 현재 로그인한 사용자가 이 사람을 팔로우하는지 여부
}

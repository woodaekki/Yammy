package com.ssafy.yammy.follow.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FollowStatusResponse {
    private boolean isFollowing;      // 내가 이 사람을 팔로우 중인지
    private long followerCount;       // 이 사람의 팔로워 수
    private long followingCount;      // 이 사람의 팔로잉 수
}

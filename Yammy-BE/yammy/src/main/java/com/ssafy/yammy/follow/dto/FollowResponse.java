package com.ssafy.yammy.follow.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FollowResponse {
    private boolean isFollowing;
    private String message;
}

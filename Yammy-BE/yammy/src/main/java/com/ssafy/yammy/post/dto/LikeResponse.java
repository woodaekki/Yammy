package com.ssafy.yammy.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class LikeResponse {
    private Boolean isLiked;
    private Integer likeCount;
}

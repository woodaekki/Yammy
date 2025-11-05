package com.ssafy.yammy.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class CommentResponse {
    private Long id;
    private Long postId;
    private Long memberId;
    private String nickname;
    private String profileImage;
    private String team;
    private String content;
    private Integer likeCount;
    private Boolean isLiked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

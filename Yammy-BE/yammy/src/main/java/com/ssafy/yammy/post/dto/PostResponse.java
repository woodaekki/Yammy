package com.ssafy.yammy.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class PostResponse {
    private Long id;
    private Long memberId;
    private String nickname;
    private String profileImage;
    private String team;
    private String bio;
    private String caption;
    private List<String> imageUrls;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean isLiked;  // 현재 사용자가 좋아요를 눌렀는지
    private Boolean isFollowing;  // 현재 사용자가 작성자를 팔로우하고 있는지
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.ssafy.yammy.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class PostListResponse {
    private List<PostResponse> posts;
    private Long nextCursor;  // 다음 페이지의 커서 (마지막 게시글 ID)
    private Boolean hasNext;  // 다음 페이지 존재 여부
}

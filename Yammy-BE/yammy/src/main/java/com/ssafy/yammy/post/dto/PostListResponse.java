package com.ssafy.yammy.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
@Data
public class PostListResponse {
    private UserInfoDto userInfo;
    private List<PostResponse> posts;
    private Long nextCursor;  // 다음 페이지의 커서 (마지막 게시글 ID)
    private Boolean hasNext;  // 다음 페이지 존재 여부
}

package com.ssafy.yammy.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class CommentListResponse {
    private List<CommentResponse> comments;
    private Long nextCursor;
    private Boolean hasNext;
}

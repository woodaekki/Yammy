package com.ssafy.yammy.comment.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    @Size(max = 500, message = "댓글은 500자 이하로 입력해주세요")
    private String content;
}

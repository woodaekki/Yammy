package com.ssafy.yammy.post.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PostUpdateRequest {
    @Size(max = 2000, message = "게시글 내용은 2000자 이하로 입력해주세요")
    private String caption;

    private List<String> imageUrls;
}

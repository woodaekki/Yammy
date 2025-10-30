package com.ssafy.yammy.post.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PostCreateRequest {
    private String caption;
    private List<String> imageUrls;  // S3 업로드된 이미지 URL 리스트 (1~3개)
}

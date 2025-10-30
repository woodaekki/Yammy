package com.ssafy.yammy.post.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PostUpdateRequest {
    private String caption;  // 캡션만 수정 가능
}

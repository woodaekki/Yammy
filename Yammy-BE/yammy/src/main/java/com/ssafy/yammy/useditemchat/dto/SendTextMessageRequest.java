package com.ssafy.yammy.useditemchat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 텍스트 메시지 전송 요청 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SendTextMessageRequest {
    @NotBlank(message = "메시지를 입력해주세요")
    @Size(max = 500, message = "메시지는 500자 이하로 입력해주세요")
    private String message;
}

package com.ssafy.yammy.useditemchat.dto;

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
    private String message;
}

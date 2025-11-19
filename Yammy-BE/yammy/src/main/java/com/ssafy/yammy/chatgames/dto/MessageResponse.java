package com.ssafy.yammy.chatgames.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MessageResponse {
    private String messageId;
    private String imageUrl;
}
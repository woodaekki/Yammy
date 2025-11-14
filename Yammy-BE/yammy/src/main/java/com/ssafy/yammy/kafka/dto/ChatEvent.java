package com.ssafy.yammy.kafka.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatEvent {
    private String chatType;     // "USED_ITEM" or "CHEERUP"
    private String roomKey;
    private Long senderId;
    private String senderNickname;
    private String messageType;  // "TEXT" or "IMAGE"
    private String content;
    private LocalDateTime timestamp;
}
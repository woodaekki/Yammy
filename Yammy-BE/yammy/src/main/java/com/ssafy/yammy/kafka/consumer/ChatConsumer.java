package com.ssafy.yammy.kafka.consumer;

import com.ssafy.yammy.chatgames.service.FirebaseChatService;
import com.ssafy.yammy.kafka.dto.ChatEvent;
import com.ssafy.yammy.useditemchat.service.UsedItemFirebaseChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatConsumer {

    private final UsedItemFirebaseChatService usedItemChatService;
    private final FirebaseChatService cheerupChatService;

    @KafkaListener(topics = "chat-messages", groupId = "chat-group")
    public void consume(ChatEvent event) {
        try {
            log.info("📥 Kafka 수신: chatType={}, roomKey={}",
                    event.getChatType(), event.getRoomKey());

            // 채팅 타입별 처리
            if ("USED_ITEM".equals(event.getChatType())) {
                handleUsedItemChat(event);
            } else if ("CHEERUP".equals(event.getChatType())) {
                handleCheerupChat(event);
            }

            log.info("✅ 처리 완료: roomKey={}", event.getRoomKey());

        } catch (Exception e) {
            log.error("❌ 처리 실패: roomKey={}, error={}",
                    event.getRoomKey(), e.getMessage(), e);
        }
    }

    private void handleUsedItemChat(ChatEvent event) throws Exception {
        if ("TEXT".equals(event.getMessageType())) {
            usedItemChatService.saveUsedItemChatTextMessage(
                    event.getRoomKey(),
                    event.getSenderId(),
                    event.getSenderNickname(),
                    event.getContent()
            );
        } else if ("IMAGE".equals(event.getMessageType())) {
            usedItemChatService.saveUsedItemChatMessage(
                    event.getRoomKey(),
                    event.getSenderId(),
                    event.getSenderNickname(),
                    event.getContent()
            );
        }
    }

    private void handleCheerupChat(ChatEvent event) throws Exception {
        if ("TEXT".equals(event.getMessageType())) {
            cheerupChatService.saveTextMessage(
                    event.getRoomKey(),
                    event.getSenderId(),
                    event.getSenderNickname(),
                    event.getContent()
            );
        } else if ("IMAGE".equals(event.getMessageType())) {
            cheerupChatService.saveImageMessage(
                    event.getRoomKey(),
                    event.getSenderId(),
                    event.getSenderNickname(),
                    event.getContent()
            );
        }
    }
}
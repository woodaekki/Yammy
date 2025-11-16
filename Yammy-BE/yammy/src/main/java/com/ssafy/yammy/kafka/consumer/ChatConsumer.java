package com.ssafy.yammy.kafka.consumer;

import com.ssafy.yammy.chatgames.service.FirebaseChatService;
import com.ssafy.yammy.kafka.dto.ChatEvent;
import com.ssafy.yammy.useditemchat.service.UsedItemChatRoomService;
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
    private final UsedItemChatRoomService usedItemChatRoomService;

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
        String lastMessageContent = null;

        if ("TEXT".equals(event.getMessageType())) {
            usedItemChatService.saveUsedItemChatTextMessage(
                    event.getRoomKey(),
                    event.getSenderId(),
                    event.getSenderNickname(),
                    event.getContent()
            );
            lastMessageContent = event.getContent();
        } else if ("IMAGE".equals(event.getMessageType())) {
            usedItemChatService.saveUsedItemChatMessage(
                    event.getRoomKey(),
                    event.getSenderId(),
                    event.getSenderNickname(),
                    event.getContent()
            );
            lastMessageContent = "사진";
        }

        // MySQL의 lastMessageContent 업데이트
        if (lastMessageContent != null) {
            usedItemChatRoomService.updateLastMessageContent(
                    event.getRoomKey(),
                    lastMessageContent
            );
        }
    }

    private void handleCheerupChat(ChatEvent event) throws Exception {
        // 익명 닉네임 생성
        String anonymousNickname = generateAnonymousNickname(
                event.getSenderTeam(),   // ← 사용자의 응원팀
                event.getSenderId()
        );
        if ("TEXT".equals(event.getMessageType())) {
            cheerupChatService.saveTextMessage(
                    event.getRoomKey(),
                    event.getSenderId(),
                    anonymousNickname,
                    event.getContent()
            );
        } else if ("IMAGE".equals(event.getMessageType())) {
            cheerupChatService.saveImageMessage(
                    event.getRoomKey(),
                    event.getSenderId(),
                    anonymousNickname,
                    event.getContent()
            );
        }
    }

    /**
     * 익명 닉네임 생성
     * @param team 사용자의 응원팀
     * @param senderId 사용자 ID
     * @return "팀명팬번호" 형식의 익명 닉네임
     */
    private String generateAnonymousNickname(String team, Long senderId) {
        // team null이거나 빈 문자열인 경우 기본값 사용 (카카오 처음에 팀 없을 때 방어)
        if (team == null || team.trim().isEmpty()) {
            team = "야구";
        }

        // senderId 기반으로 1~1000 사이 번호 생성
        int number = (int)(senderId % 1000) + 1;

        // "팀명팬번호" 형식으로 반환
        return team + "팬" + number;
    }

}
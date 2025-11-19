package com.ssafy.yammy.kafka.producer;

import com.ssafy.yammy.kafka.dto.ChatEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatProducer {

    private final KafkaTemplate<String, ChatEvent> kafkaTemplate;

    public void send(ChatEvent event) {
        log.info("📤 Kafka 발송: chatType={}, roomKey={}",
                event.getChatType(), event.getRoomKey());

        // roomKey를 key로 사용 → 같은 방의 메시지는 순서 보장
        kafkaTemplate.send("chat-messages", event.getRoomKey(), event);
    }
}
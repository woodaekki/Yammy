package com.ssafy.yammy.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic chatTopic() {
        return TopicBuilder.name("chat-messages")
                .partitions(3)      // 병렬 처리 3개
                .replicas(1)        // 로컬: 1, 운영: 3
                .build();
    }
}
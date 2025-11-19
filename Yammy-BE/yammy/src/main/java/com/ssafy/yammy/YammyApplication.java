package com.ssafy.yammy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableJpaAuditing
@SpringBootApplication
@EnableScheduling // s3 고아 파일 방지 체크용
public class YammyApplication {

    public static void main(String[] args) {
        SpringApplication.run(YammyApplication.class, args);
    }

}

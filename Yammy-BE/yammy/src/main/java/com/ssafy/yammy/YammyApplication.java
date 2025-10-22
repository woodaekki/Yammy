package com.ssafy.yammy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class YammyApplication {

    public static void main(String[] args) {
        SpringApplication.run(YammyApplication.class, args);
    }

}

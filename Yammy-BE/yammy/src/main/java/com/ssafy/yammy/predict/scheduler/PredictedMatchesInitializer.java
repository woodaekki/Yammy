package com.ssafy.yammy.predict.scheduler;

import com.ssafy.yammy.predict.service.PredictService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * 서버 시작시 및 매일 오후 5시 predicted_matches 초기화 컴포넌트
 * 오늘 날짜의 경기 정보를 자동으로 생성하여 배팅 가능하도록 준비
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PredictedMatchesInitializer {
    
    private final PredictService predictService;
    
    /**
     * 서버 시작 완료 후 오늘 날짜의 predicted_matches 생성
     * ApplicationReadyEvent: 모든 빈 초기화와 설정 완료 후 실행
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initializeTodayMatches() {
        try {
            log.info("Server startup - predicted_matches initialization starting");

            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            Thread.sleep(2000);

            String result = predictService.recreatePredictedMatchesForDate(today);
            log.info("Server startup - predicted_matches initialization completed: {}", result);

        } catch (Exception e) {
            log.error("Server startup - predicted_matches initialization failed: {}", e.getMessage(), e);
        }
    }
    
    /**
     * 매일 오후 5시에 자동으로 predicted_matches 초기화 실행
     * 기존 모든 데이터 삭제 후 오늘 경기만 새로 생성
     * cron = "0 0 17 * * *" : 초(0) 분(0) 시(17) 일(*) 월(*) 요일(*)
     */
    @Scheduled(cron = "0 0 17 * * *")
    public void scheduleMatchesUpdate() {
        try {
            log.info("Scheduler - 5PM predicted_matches auto-initialization starting");

            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String result = predictService.recreatePredictedMatchesForDate(today);
            log.info("Scheduler - predicted_matches initialization completed: {}", result);

        } catch (Exception e) {
            log.error("Scheduler - 5PM auto-initialization failed: {}", e.getMessage(), e);
        }
    }

    /**
     * 특정 날짜의 경기 정보 초기화 (필요시 수동 호출용)
     * @param targetDate yyyy-MM-dd 형식의 날짜
     */
    public String initializeMatchesForDate(String targetDate) {
        try {
            log.info("Manual execution - predicted_matches initialization for date: {}", targetDate);
            return predictService.recreatePredictedMatchesForDate(targetDate);
        } catch (Exception e) {
            String error = "predicted_matches 초기화 실패: " + e.getMessage();
            log.error("Manual execution failed: {}", error, e);
            return error;
        }
    }
}

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
@Component
@RequiredArgsConstructor
@Slf4j
public class PredictedMatchesInitializer {
    
    private final PredictService predictService;
    
    /**
     * 서버 시작 완료 후 오늘 날짜의 predicted_matches 생성
     * ApplicationReadyEvent: 모든 빈 초기화와 설정 완료 후 실행
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initializeTodayMatches() {
        try {
            log.info("🚀🚀🚀 [서버시작] predicted_matches 초기화 시작 🚀🚀🚀");
            
            // 오늘 날짜를 yyyy-MM-dd 형식으로 계산 (DB 형식과 맞춤)
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            log.info("📅📅📅 [서버시작] 대상 날짜: {} 📅📅📅", today);
            
            // 잠시 대기 후 실행 (DB 연결 안정화)
            Thread.sleep(2000);
            
            // 오늘 날짜의 predicted_matches 생성
            String result = predictService.recreatePredictedMatchesForDate(today);
            log.info("✅✅✅ [서버시작] {} ✅✅✅", result);
            
        } catch (Exception e) {
            log.error("❌❌❌ [서버시작] predicted_matches 초기화 실패: {} ❌❌❌", e.getMessage(), e);
            // 서버 시작을 막지 않기 위해 예외를 다시 던지지 않음
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
            log.info("⏰⏰⏰ [스케줄러] 오후 5시 predicted_matches 자동 초기화 시작 ⏰⏰⏰");
            
            // 오늘 날짜를 yyyy-MM-dd 형식으로 계산
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            log.info("📅📅📅 [스케줄러] 대상 날짜: {} 📅📅📅", today);
            
            // 기존 데이터 전체 삭제 후 오늘 경기만 새로 생성
            String result = predictService.recreatePredictedMatchesForDate(today);
            log.info("✅✅✅ [스케줄러] {} ✅✅✅", result);
            
        } catch (Exception e) {
            log.error("❌❌❌ [스케줄러] 오후 5시 자동 초기화 실패: {} ❌❌❌", e.getMessage(), e);
            // 스케줄러 오류는 로그만 남기고 계속 실행
        }
    }
    
    /**
     * 특정 날짜의 경기 정보 초기화 (필요시 수동 호출용)
     * @param targetDate yyyy-MM-dd 형식의 날짜
     */
    public String initializeMatchesForDate(String targetDate) {
        try {
            log.info("🔧 [수동실행] predicted_matches 초기화 - 날짜: {}", targetDate);
            return predictService.recreatePredictedMatchesForDate(targetDate);
        } catch (Exception e) {
            String error = "predicted_matches 초기화 실패: " + e.getMessage();
            log.error("❌ [수동실행] {}", error, e);
            return error;
        }
    }
}

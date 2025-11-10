package com.ssafy.yammy.predict.service;

import com.ssafy.yammy.predict.dto.MatchScheduleResponse;
import com.ssafy.yammy.predict.entity.PredictMatchSchedule;
import com.ssafy.yammy.predict.repository.PredictMatchScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PredictService {

    private final PredictMatchScheduleRepository predictMatchScheduleRepository;

    /**
     * 특정 날짜의 경기 목록 조회
     * @param matchDate 경기 날짜 (예: "20251110")
     * @return 해당 날짜의 경기 목록
     */
    public List<MatchScheduleResponse> getMatchesByDate(String matchDate) {
        log.info("특정 날짜의 경기 조회 요청: {}", matchDate);
        
        // Repository에서 해당 날짜의 경기 목록 조회
        List<PredictMatchSchedule> matchSchedules = predictMatchScheduleRepository.findByMatchDate(matchDate);
        
        // Entity를 DTO로 변환하여 반환 (배당률은 컨트롤러에서 처리)
        return matchSchedules.stream()
                .map(MatchScheduleResponse::from)
                .collect(Collectors.toList());
    }
}

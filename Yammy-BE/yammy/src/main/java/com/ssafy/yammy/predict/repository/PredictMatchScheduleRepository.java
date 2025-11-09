package com.ssafy.yammy.predict.repository;

import com.ssafy.yammy.predict.entity.PredictMatchSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictMatchScheduleRepository extends JpaRepository<PredictMatchSchedule, Long> {

    // 특정 날짜의 경기 목록 조회
    List<PredictMatchSchedule> findByMatchDate(String matchDate);
}

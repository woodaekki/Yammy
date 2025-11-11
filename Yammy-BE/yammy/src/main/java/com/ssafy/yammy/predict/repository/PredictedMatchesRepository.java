package com.ssafy.yammy.predict.repository;

import com.ssafy.yammy.predict.entity.PredictedMatches;
import com.ssafy.yammy.predict.entity.PredictMatchSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PredictedMatchesRepository extends JpaRepository<PredictedMatches, Long> {
    
    /**
     * match_schedule ID로 predicted_match 조회
     */
    @Query("SELECT pm FROM PredictedMatches pm WHERE pm.matchSchedule.id = :matchScheduleId")
    Optional<PredictedMatches> findByMatchScheduleId(@Param("matchScheduleId") Long matchScheduleId);
    
    /**
     * 정산되지 않은 경기들 조회
     */
    List<PredictedMatches> findByIsSettled(Integer isSettled);
    
    /**
     * 특정 날짜의 경기들 조회
     */
    @Query("SELECT pm FROM PredictedMatches pm WHERE pm.matchSchedule.matchDate = :matchDate")
    List<PredictedMatches> findByMatchDate(@Param("matchDate") String matchDate);
    
    /**
     * 홈팀과 원정팀으로 경기 조회
     */
    Optional<PredictedMatches> findByHomeAndAway(String home, String away);
}

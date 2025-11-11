package com.ssafy.yammy.predict.repository;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.predict.entity.Predicted;
import com.ssafy.yammy.predict.entity.PredictedMatches;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictedRepository extends JpaRepository<Predicted, Long> {
    
    /**
     * 특정 사용자의 배팅 내역 조회
     */
    Page<Predicted> findByMemberOrderByIdDesc(Member member, Pageable pageable);
    
    /**
     * 특정 경기의 모든 배팅 조회
     */
    List<Predicted> findByPredictedMatch(PredictedMatches predictedMatch);
    
    /**
     * 특정 경기의 홈팀 배팅 총액 계산
     */
    @Query("SELECT COALESCE(SUM(p.batAmount), 0) FROM Predicted p WHERE p.predictedMatch.id = :predictedMatchId AND p.predict = 0 AND p.isSettled = 0")
    Long calculateHomeBetAmount(@Param("predictedMatchId") Long predictedMatchId);
    
    /**
     * 특정 경기의 원정팀 배팅 총액 계산  
     */
    @Query("SELECT COALESCE(SUM(p.batAmount), 0) FROM Predicted p WHERE p.predictedMatch.id = :predictedMatchId AND p.predict = 1 AND p.isSettled = 0")
    Long calculateAwayBetAmount(@Param("predictedMatchId") Long predictedMatchId);
    
    /**
     * 특정 사용자의 특정 경기 배팅 조회
     */
    List<Predicted> findByMemberAndPredictedMatch(Member member, PredictedMatches predictedMatch);
    
    /**
     * 정산되지 않은 배팅들 조회
     */
    List<Predicted> findByIsSettled(Integer isSettled);
    
    /**
     * 특정 경기의 정산되지 않은 배팅들 조회
     */
    List<Predicted> findByPredictedMatchAndIsSettled(PredictedMatches predictedMatch, Integer isSettled);
}

package com.ssafy.yammy.match.repository;

import com.ssafy.yammy.match.entity.Scoreboard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScoreboardRepository extends JpaRepository<Scoreboard, Long> {

    // matchcode로 조회 (한 경기의 양 팀 스코어보드)
    List<Scoreboard> findByMatchcode(String matchcode);

    // 최근 경기 목록 조회 (날짜 내림차순)
    @Query("SELECT s.matchcode, s.matchdate, s.home, s.away, s.place " +
           "FROM Scoreboard s " +
           "WHERE s.id IN (SELECT MIN(s2.id) FROM Scoreboard s2 GROUP BY s2.matchcode) " +
           "ORDER BY s.id DESC")
    Page<Object[]> findRecentMatches(Pageable pageable);

    // 특정 날짜의 경기 조회
    @Query("SELECT s FROM Scoreboard s WHERE s.matchdate = :date ORDER BY s.matchcode, s.idx")
    List<Scoreboard> findByMatchdate(@Param("date") LocalDate date);

    // 특정 팀의 최근 경기 조회
    @Query("SELECT s FROM Scoreboard s " +
           "WHERE (s.home = :team OR s.away = :team) " +
           "AND s.id IN (SELECT MIN(s2.id) FROM Scoreboard s2 GROUP BY s2.matchcode) " +
           "ORDER BY s.id DESC")
    Page<Scoreboard> findByTeam(@Param("team") String team, Pageable pageable);

    // 날짜 범위로 경기 조회
    @Query("SELECT s FROM Scoreboard s " +
           "WHERE s.matchdate BETWEEN :startDate AND :endDate " +
           "AND s.id IN (SELECT MIN(s2.id) FROM Scoreboard s2 GROUP BY s2.matchcode) " +
           "ORDER BY s.id DESC")
    Page<Scoreboard> findByDateRange(@Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate,
                                      Pageable pageable);
}

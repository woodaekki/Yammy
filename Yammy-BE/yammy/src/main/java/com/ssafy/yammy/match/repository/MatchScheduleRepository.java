package com.ssafy.yammy.match.repository;

import com.ssafy.yammy.match.entity.MatchSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MatchScheduleRepository extends JpaRepository<MatchSchedule, Long> {

    List<MatchSchedule> findByMatchDate(LocalDate matchDate);

    List<MatchSchedule> findByYear(Integer year);

    List<MatchSchedule> findByMatchDateBetween(LocalDate startDate, LocalDate endDate);
}

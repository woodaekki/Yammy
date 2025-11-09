package com.ssafy.yammy.match.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "match_schedule")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "match_status")
    private String matchStatus;

    @Column(name = "match_date")
    private LocalDate matchDate;

    private String home;
    private String away;
    private String dbheader;
    private String gameid;

    @Column(name = "year")
    private Integer year;
}

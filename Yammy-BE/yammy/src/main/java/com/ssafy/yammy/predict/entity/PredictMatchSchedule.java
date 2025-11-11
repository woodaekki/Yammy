package com.ssafy.yammy.predict.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "match_schedule")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictMatchSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "match_status", length = 50)
    private String matchStatus;

    @Column(name = "match_date", length = 20)
    private String matchDate;

    @Column(name = "home", length = 10)
    private String home;

    @Column(name = "away", length = 10)
    private String away;

    @Column(name = "dbheader")
    private Integer dbheader;

    @Column(name = "gameid", length = 20)
    private String gameid;

    @Column(name = "year")
    private Integer year;
}

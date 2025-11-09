package com.ssafy.yammy.match.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "scoreboard")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scoreboard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String matchcode;

    @Column(name = "idx")
    private Long idx;

    private String team;
    private String result;

    // 이닝별 득점
    @Column(name = "i_1")
    private Integer i1;
    @Column(name = "i_2")
    private Integer i2;
    @Column(name = "i_3")
    private Integer i3;
    @Column(name = "i_4")
    private Integer i4;
    @Column(name = "i_5")
    private Integer i5;
    @Column(name = "i_6")
    private Integer i6;
    @Column(name = "i_7")
    private Integer i7;
    @Column(name = "i_8")
    private Integer i8;
    @Column(name = "i_9")
    private Integer i9;
    @Column(name = "i_10")
    private Integer i10;
    @Column(name = "i_11")
    private Integer i11;
    @Column(name = "i_12")
    private Integer i12;
    @Column(name = "i_13")
    private Integer i13;
    @Column(name = "i_14")
    private Integer i14;
    @Column(name = "i_15")
    private Integer i15;
    @Column(name = "i_16")
    private Integer i16;
    @Column(name = "i_17")
    private Integer i17;
    @Column(name = "i_18")
    private Integer i18;

    // 총합
    private Integer run;    // 득점
    private Integer hit;    // 안타
    private Integer err;    // 실책
    private Integer balls;  // 볼넷

    // 경기 정보
    private LocalDate matchdate;
    private String matchday;
    private String home;
    private String away;
    private String dbheader;
    private String place;
    private Integer audience;
    private LocalTime starttime;
    private LocalTime endtime;
    private String gametime;
}

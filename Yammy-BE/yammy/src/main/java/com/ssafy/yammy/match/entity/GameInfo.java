package com.ssafy.yammy.match.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "game_info")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GameInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String matchcode;

    private String gwrbi;       // 결승타
    private String gametime;    // 경기시간
    private String stadium;     // 구장
    private String endtime;     // 종료시간
    private String referee;     // 심판
    private String triple;      // 3루타
    private String cs;          // 도루자
    private String sb;          // 도루
    private String pickoff;     // 견제
    private String starttime;   // 시작시간
    private String passedball;  // 포일
    private String err;         // 실책
    private String oob;         // 주루사
    private String doublehit;   // 2루타
    private String doubleout;   // 병살타
    private String wildpitch;   // 폭투
    private String homerun;     // 홈런
    private String crowd;       // 관중
}

package com.ssafy.yammy.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRequest {
    private String matchcode;  // KBO 경기 코드 (선택)
    private String game;       // 경기명
    private LocalDate date;    // 경기 날짜
    private String location;   // 경기장
    private String seat;       // 좌석
    private String comment;    // 한줄평
    private String type;       // 종목
    private Integer awayScore; // 원정팀 점수
    private Integer homeScore; // 홈팀 점수
    private String review;     // 상세 리뷰
    private String team;       // 응원 팀 (티켓 배경용)
}

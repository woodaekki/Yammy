package com.ssafy.yammy.ticket.dto;

import jakarta.validation.constraints.Size;
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

    @Size(max = 100, message = "경기명은 100자 이하로 입력해주세요")
    private String game;       // 경기명

    private LocalDate date;    // 경기 날짜

    @Size(max = 100, message = "경기장은 100자 이하로 입력해주세요")
    private String location;   // 경기장

    @Size(max = 10, message = "좌석은 10자 이하로 입력해주세요")
    private String seat;       // 좌석

    @Size(max = 15, message = "한줄평은 15자 이하로 입력해주세요")
    private String comment;    // 한줄평

    private String type;       // 종목
    private Integer awayScore; // 원정팀 점수
    private Integer homeScore; // 홈팀 점수

    @Size(max = 50, message = "상세 리뷰는 50자 이하로 입력해주세요")
    private String review;     // 상세 리뷰

    private String team;       // 응원 팀 (티켓 배경용)
}

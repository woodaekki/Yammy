package com.ssafy.yammy.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchResponse {
    private String matchcode;
    private LocalDate matchdate;
    private String home;
    private String away;
    private String place;
    private Integer homeScore;
    private Integer awayScore;
    private String gametime;
    private Integer audience;
    private String matchStatus;  // 경기 상태 (취소 등)
    private List<InningScore> innings;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InningScore {
        private String team;
        private List<Integer> scores;  // 이닝별 득점
        private Integer run;
        private Integer hit;
        private Integer err;
    }
}

package com.ssafy.yammy.predict.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchOddsResponse {

    private Long predictedMatchId;
    private String homeTeam;
    private String awayTeam;
    private Double homeOdds; // 홈팀 배당률
    private Double awayOdds; // 원정팀 배당률
    private Long homeBetAmount; // 홈팀 총 배팅 금액
    private Long awayBetAmount; // 원정팀 총 배팅 금액
    private Long totalBetAmount; // 총 배팅 금액

    /**
     * 배당률 정보와 배팅 풀 정보를 포함한 응답 생성
     */
    public static MatchOddsResponse of(Long predictedMatchId, String homeTeam, String awayTeam,
                                       Double homeOdds, Double awayOdds, 
                                       Long homeBetAmount, Long awayBetAmount) {
        return MatchOddsResponse.builder()
                .predictedMatchId(predictedMatchId)
                .homeTeam(homeTeam)
                .awayTeam(awayTeam)
                .homeOdds(homeOdds)
                .awayOdds(awayOdds)
                .homeBetAmount(homeBetAmount)
                .awayBetAmount(awayBetAmount)
                .totalBetAmount(homeBetAmount + awayBetAmount)
                .build();
    }
}

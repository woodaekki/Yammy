package com.ssafy.yammy.predict.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BettingPoolInfo {
    
    private long homeBetAmount;      // 홈팀에 배팅된 총 경험치
    private long awayBetAmount;      // 원정팀에 배팅된 총 경험치
    private long totalBetAmount;     // 전체 배팅된 총 경험치
    
    /**
     * 홈팀 배팅 비율
     */
    public double getHomeRatio() {
        if (totalBetAmount == 0) return 0.5;
        return (double) homeBetAmount / totalBetAmount;
    }
    
    /**
     * 원정팀 배팅 비율
     */
    public double getAwayRatio() {
        if (totalBetAmount == 0) return 0.5;
        return (double) awayBetAmount / totalBetAmount;
    }
    
    /**
     * 더 많이 배팅된 팀 (0: 홈팀, 1: 원정팀)
     */
    public int getFavoriteTeam() {
        return homeBetAmount >= awayBetAmount ? 0 : 1;
    }
}

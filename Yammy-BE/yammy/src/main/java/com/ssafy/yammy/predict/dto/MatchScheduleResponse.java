package com.ssafy.yammy.predict.dto;

import com.ssafy.yammy.predict.entity.PredictMatchSchedule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchScheduleResponse {
    
    private Long id;
    private String matchStatus;
    private String matchDate;
    private String home;
    private String away;
    private String gameid;
    private Integer year;
    
    // 배당률 추가
    private Double homeOdds;  // 홈팀 배당률
    private Double awayOdds;  // 원정팀 배당률
    
    // 배팅 금액 추가
    private Long homeAmount;  // 홈팀 배팅 금액
    private Long awayAmount;  // 원정팀 배팅 금액

    // 팀 코드를 팀 이름으로 변환하는 매핑
    private static final Map<String, String> TEAM_NAME_MAP = new HashMap<String, String>() {{
        put("HT", "KIA");
        put("SS", "삼성");
        put("LG", "LG");
        put("OB", "두산");
        put("KT", "KT");
        put("SK", "SSG");
        put("LT", "롯데");
        put("HH", "한화");
        put("NC", "NC");
        put("WO", "키움");
    }};

    // 팀 코드를 팀 이름으로 변환하는 메소드
    private static String convertTeamName(String teamCode) {
        return TEAM_NAME_MAP.getOrDefault(teamCode, teamCode);
    }

    // Entity를 DTO로 변환하는 정적 메소드 (배당률 및 배팅금액 포함)
    public static MatchScheduleResponse from(PredictMatchSchedule matchSchedule, Double homeOdds, Double awayOdds, Long homeAmount, Long awayAmount) {
        return MatchScheduleResponse.builder()
                .id(matchSchedule.getId())
                .matchStatus(matchSchedule.getMatchStatus())
                .matchDate(matchSchedule.getMatchDate())
                .home(convertTeamName(matchSchedule.getHome()))
                .away(convertTeamName(matchSchedule.getAway()))
                .gameid(matchSchedule.getGameid())
                .year(matchSchedule.getYear())
                .homeOdds(homeOdds)
                .awayOdds(awayOdds)
                .homeAmount(homeAmount)
                .awayAmount(awayAmount)
                .build();
    }
    
    // 배당률만 포함하는 메소드 (호환성 유지)
    public static MatchScheduleResponse from(PredictMatchSchedule matchSchedule, Double homeOdds, Double awayOdds) {
        return from(matchSchedule, homeOdds, awayOdds, null, null);
    }
    
    // 배당률 없이 변환하는 기존 메소드 (호환성 유지)
    public static MatchScheduleResponse from(PredictMatchSchedule matchSchedule) {
        return from(matchSchedule, null, null);
    }
}

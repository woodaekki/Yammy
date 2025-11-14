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

    private Long id;  // match_schedule 테이블의 ID
    private Long predictedMatchId;  // predicted_matches 테이블의 ID (정산용)
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

    // 정산 여부 추가
    private Integer isSettled;  // 정산 여부 (0: 미정산, 1: 정산 완료)

    // 팀 코드를 팀 이름으로 변환하는 매핑
    private static final Map<String, String> TEAM_NAME_MAP;
    
    static {
        TEAM_NAME_MAP = new HashMap<>();
        TEAM_NAME_MAP.put("HT", "KIA");
        TEAM_NAME_MAP.put("SS", "삼성");
        TEAM_NAME_MAP.put("LG", "LG");
        TEAM_NAME_MAP.put("OB", "두산");
        TEAM_NAME_MAP.put("KT", "KT");
        TEAM_NAME_MAP.put("SK", "SSG");
        TEAM_NAME_MAP.put("LT", "롯데");
        TEAM_NAME_MAP.put("HH", "한화");
        TEAM_NAME_MAP.put("NC", "NC");
        TEAM_NAME_MAP.put("WO", "키움");
    }

    // 팀 코드를 팀 이름으로 변환하는 메소드
    private static String convertTeamName(String teamCode) {
        return TEAM_NAME_MAP.getOrDefault(teamCode, teamCode);
    }

    // Entity를 DTO로 변환하는 정적 메소드 (배당률 및 배팅금액 포함)
    public static MatchScheduleResponse from(PredictMatchSchedule matchSchedule, Long predictedMatchId, Double homeOdds, Double awayOdds, Long homeAmount, Long awayAmount, Integer isSettled) {
        return MatchScheduleResponse.builder()
                .id(matchSchedule.getId())
                .predictedMatchId(predictedMatchId)
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
                .isSettled(isSettled)
                .build();
    }
    
    // 배당률만 포함하는 메소드 (호환성 유지)
    public static MatchScheduleResponse from(PredictMatchSchedule matchSchedule, Double homeOdds, Double awayOdds) {
        return from(matchSchedule, null, homeOdds, awayOdds, null, null, null);
    }

    // 배당률 없이 변환하는 기존 메소드 (호환성 유지)
    public static MatchScheduleResponse from(PredictMatchSchedule matchSchedule) {
        return from(matchSchedule, null, null, null, null, null, null);
    }
}

package com.ssafy.yammy.predict.dto;

import com.ssafy.yammy.predict.entity.Betting;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "배팅 정보 응답")
public class BettingResponse {

    @Schema(description = "배팅 ID", example = "1")
    private Long id;

    @Schema(description = "경기 ID", example = "1")
    private Long matchId;

    @Schema(description = "홈팀", example = "SSG")
    private String homeTeam;

    @Schema(description = "원정팀", example = "KIA")
    private String awayTeam;

    @Schema(description = "경기 날짜", example = "20251110")
    private String matchDate;

    @Schema(description = "선택된 팀 (0: 홈팀, 1: 원정팀)", example = "0")
    private Integer selectedTeam;

    @Schema(description = "선택된 팀명", example = "SSG")
    private String selectedTeamName;

    @Schema(description = "배팅 금액", example = "1000")
    private Long betAmount;

    @Schema(description = "배당률", example = "2.5")
    private Double odds;

    @Schema(description = "예상 수익", example = "2500")
    private Long expectedReturn;

    @Schema(description = "배팅 상태 (PENDING, WIN, LOSE, CANCELLED)", example = "PENDING")
    private String status;

    @Schema(description = "실제 수익 (결과 확정 후)", example = "2500")
    private Long actualReturn;

    @Schema(description = "배팅 생성 시간", example = "2025-11-10T14:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "배팅 수정 시간", example = "2025-11-10T14:30:00")
    private LocalDateTime updatedAt;

    public static BettingResponse from(Betting betting) {
        String selectedTeamName = betting.getSelectedTeam() == 0 
            ? betting.getMatchSchedule().getHome() 
            : betting.getMatchSchedule().getAway();

        return BettingResponse.builder()
                .id(betting.getId())
                .matchId(betting.getMatchSchedule().getId())
                .homeTeam(betting.getMatchSchedule().getHome())
                .awayTeam(betting.getMatchSchedule().getAway())
                .matchDate(betting.getMatchSchedule().getMatchDate())
                .selectedTeam(betting.getSelectedTeam())
                .selectedTeamName(selectedTeamName)
                .betAmount(betting.getBetAmount())
                .odds(betting.getOdds())
                .expectedReturn(betting.getExpectedReturn())
                .status(betting.getStatus().name())
                .actualReturn(betting.getActualReturn())
                .createdAt(betting.getCreatedAt())
                .updatedAt(betting.getUpdatedAt())
                .build();
    }
}

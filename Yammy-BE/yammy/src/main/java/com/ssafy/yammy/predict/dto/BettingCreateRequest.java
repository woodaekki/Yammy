package com.ssafy.yammy.predict.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "배팅 생성 요청")
public class BettingCreateRequest {

    @NotNull(message = "경기 ID는 필수입니다")
    @Schema(description = "경기 ID", example = "1")
    private Long matchId;

    @NotNull(message = "선택된 팀은 필수입니다")
    @Schema(description = "선택된 팀 (0: 홈팀, 1: 원정팀)", example = "0")
    private Integer selectedTeam;

    @NotNull(message = "배팅 금액은 필수입니다")
    @Min(value = 100, message = "배팅 금액은 최소 100팬심 이상이어야 합니다")
    @Schema(description = "배팅 금액", example = "1000")
    private Long betAmount;

    @NotNull(message = "예상 수익은 필수입니다")
    @Min(value = 0, message = "예상 수익은 0 이상이어야 합니다")
    @Schema(description = "예상 수익", example = "2000")
    private Long expectedReturn;
}

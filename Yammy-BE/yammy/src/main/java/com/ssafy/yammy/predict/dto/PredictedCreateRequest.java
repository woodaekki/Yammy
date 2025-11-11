package com.ssafy.yammy.predict.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictedCreateRequest {

    @NotNull(message = "경기 ID는 필수입니다.")
    private Long predictedMatchId; // predicted_matches 테이블의 id

    @NotNull(message = "예측 팀은 필수입니다.")
    private Integer predict; // 0: 홈팀, 1: 원정팀

    @NotNull(message = "배팅 금액은 필수입니다.")
    @Min(value = 100, message = "최소 배팅 금액은 100팬심입니다.")
    private Long batAmount;
}

package com.ssafy.yammy.predict.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementRequest {

    @NotNull(message = "경기 ID는 필수입니다.")
    private Long matchId; // predicted_matches 테이블의 id

    @NotNull(message = "경기 결과는 필수입니다.")
    private Integer result; // 0: 홈팀 승, 1: 원정팀 승
}

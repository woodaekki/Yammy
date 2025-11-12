package com.ssafy.yammy.predict.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementResponse {

    private Integer settledMatchesCount; // 정산된 경기 수
    private Integer totalWinners; // 총 당첨자 수
    private Long totalPayback; // 총 지급된 팬심
    private String message; // 결과 메시지
}

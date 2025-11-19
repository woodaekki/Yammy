package com.ssafy.yammy.predict.dto;

import com.ssafy.yammy.predict.entity.Predicted;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictedResponse {

    private Long id;
    private Long memberId;
    private String memberNickname;
    private Long predictedMatchId;
    private String homeTeam;
    private String awayTeam;
    private Integer predict; // 0: 홈팀, 1: 원정팀
    private Long batAmount;
    private Long paybackAmount;
    private Double odds; // 배당률 (paybackAmount / batAmount)
    private Integer isSettled; // 정산 여부

    /**
     * Entity -> Response DTO 변환
     */
    public static PredictedResponse from(Predicted predicted) {
        double odds = predicted.getBatAmount() > 0 ? 
            (double) predicted.getPaybackAmount() / predicted.getBatAmount() : 0.0;

        return PredictedResponse.builder()
                .id(predicted.getId())
                .memberId(predicted.getMember().getMemberId())
                .memberNickname(predicted.getMember().getNickname())
                .predictedMatchId(predicted.getPredictedMatch().getId())
                .homeTeam(predicted.getPredictedMatch().getHome())
                .awayTeam(predicted.getPredictedMatch().getAway())
                .predict(predicted.getPredict())
                .batAmount(predicted.getBatAmount())
                .paybackAmount(predicted.getPaybackAmount())
                .odds(Math.round(odds * 100.0) / 100.0) // 소수점 2자리
                .isSettled(predicted.getIsSettled())
                .build();
    }
}

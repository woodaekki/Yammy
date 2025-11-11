package com.ssafy.yammy.predict.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "사용자 포인트 정보 응답")
public class UserPointsResponse {

    @Schema(description = "사용자 ID", example = "1")
    private Long memberId;

    @Schema(description = "현재 포인트", example = "10000")
    private Long points;

    @Schema(description = "사용자 닉네임", example = "야구팬123")
    private String nickname;
}

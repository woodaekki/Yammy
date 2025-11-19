package com.ssafy.yammy.payment.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PointUseRequest {
    private Long amount; // 사용할 금액
}

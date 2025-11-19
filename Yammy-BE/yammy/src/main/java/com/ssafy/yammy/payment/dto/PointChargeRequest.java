package com.ssafy.yammy.payment.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PointChargeRequest {
    private Long amount; // 충전할 금액
}

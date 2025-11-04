package com.ssafy.yammy.payment.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TossPaymentRequest {

    private String paymentKey;  // 결제 키 값
    private String orderId;     // 주문 고유 ID
    private Long amount; // 계좌 이체 금액
}

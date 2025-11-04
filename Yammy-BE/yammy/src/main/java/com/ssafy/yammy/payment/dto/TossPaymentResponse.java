package com.ssafy.yammy.payment.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString // 콘솔에 해시(메모리 주소)값을 문자열 형태로 보여주는 메서드
public class TossPaymentResponse {
    private String orderId;      // 주문 ID
    private String paymentKey;   // 결제 키
    private Long amount;         // 결제 금액
    private String status;       // 결제 상태
    private String requestedAt;  // 결제 요청
    private String approvedAt;   // 결제 승인
    private Object failure;      // 실패 정보 담은 객체
}

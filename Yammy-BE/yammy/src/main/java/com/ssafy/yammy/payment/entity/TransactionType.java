package com.ssafy.yammy.payment.entity;

public enum TransactionType {
    CHARGE, // toss 충전
    ESCROW_DEPOSIT, // 거래 예치
    ESCROW_CONFIRMED, // 거래 확정
    ESCROW_CANCEL // 거래 취소
}

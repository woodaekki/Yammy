package com.ssafy.yammy.withdrawal.entity;

public enum WithdrawalStatus {
    REQUESTED, // 사용자의 환전 요청
    APPROVED, // 관리자의 승인
    COMPLETED, // 포인트 차감 및 실제 송금처리 완료
    DENIED // 요청 거절
}

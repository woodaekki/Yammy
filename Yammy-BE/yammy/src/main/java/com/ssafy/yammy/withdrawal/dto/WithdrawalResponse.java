package com.ssafy.yammy.withdrawal.dto;

import com.ssafy.yammy.withdrawal.entity.WithdrawalStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class WithdrawalResponse {
    private Long id;
    private WithdrawalStatus status;
    private Long amount;
    private String bankName;
    private String accountNumber;
    private String denyReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


package com.ssafy.yammy.withdrawal.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WithdrawalRequest {
    private Long amount;
    private String bankName;
    private String accountNumber;
}


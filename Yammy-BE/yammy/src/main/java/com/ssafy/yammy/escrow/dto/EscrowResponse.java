package com.ssafy.yammy.escrow.dto;

import com.ssafy.yammy.escrow.entity.EscrowStatus;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EscrowResponse {
    private Long id;
    private Long chatRoomId;
    private Long buyerId;
    private Long sellerId;
    private Long amount;
    private EscrowStatus status;
    private LocalDateTime createdAt;
}

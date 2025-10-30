package com.ssafy.yammy.payment.entity;
import com.ssafy.yammy.auth.entity.Member;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    private String orderId;
    private String paymentKey;
    private Integer amount;
    private String status;

    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;

    @Column(columnDefinition = "json")
    private String failure; // 실패 시 JSON
}

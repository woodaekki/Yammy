package com.ssafy.yammy.payment.entity;

import com.ssafy.yammy.auth.entity.Member;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "toss_payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TossPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "toss_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "order_id", length = 100, nullable = false)
    private String orderId;

    @Column(name = "payment_key", length = 200, nullable = false, unique = true)
    private String paymentKey;

    @Column(name = "amount", length = 50, nullable = false)
    private Long amount;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Lob
    @Column(name = "failure")
    private String failure;
}

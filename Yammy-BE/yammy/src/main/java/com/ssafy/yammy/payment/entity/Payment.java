package com.ssafy.yammy.payment.entity;

import com.ssafy.yammy.auth.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Table(name = "toss_payment")
@Entity
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "toss_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "order_id")
    private String orderId;

    @Column(name = "payment_key")
    private String paymentKey;

    @Column(name = "amount")
    private Long amount;

    @Column(name = "status")
    private String status;

    @Column(name = "request_at")
    private String requestedAt;

    @Column(name = "approved_at")
    private String approvedAt;

    @Column(name = "failure", columnDefinition = "TEXT")
    private String failure; // JSON 문자열로 저장
}

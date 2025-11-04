package com.ssafy.yammy.payment.entity;

import com.ssafy.yammy.auth.entity.Member;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "point_transaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "toss_id", nullable = false)
    private TossPayment tossPayment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "point_id", nullable = false)
    private Point point;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "amount")
    private Long amount;

    @Column(name = "reference_id")
    private Integer referenceId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

package com.ssafy.yammy.payment.entity;

import jakarta.persistence.*;
import com.ssafy.yammy.auth.entity.Member;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

public class Point {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "point_id", nullable = false)
    private Long id;

    @OneToOne
    @Column(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "balance", nullable = false)
    private Integer balance;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

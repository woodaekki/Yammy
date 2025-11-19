package com.ssafy.yammy.payment.entity;

import jakarta.persistence.*;
import com.ssafy.yammy.auth.entity.Member;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "point")
public class Point {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "point_id", nullable = false)
    private Long id;

    @OneToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "balance", nullable = false)
    private Long balance = 0L; // 기본 값

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 포인트 증가
    public void increase(Long amount) {
        this.balance += amount;
    }

    // 포인트 감소
    public void decrease(Long amount) {
        if (this.balance < amount) {
            throw new IllegalStateException("포인트 잔액이 부족합니다.");
        }
        this.balance -= amount;
    }
}

package com.ssafy.yammy.predict.entity;

import com.ssafy.yammy.auth.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "betting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Betting {

    public enum BettingStatus {
        PENDING,    // 경기 시작 전 (대기중)
        WIN,        // 승리
        LOSE,       // 패배
        CANCELLED   // 취소됨
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "betting_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private PredictMatchSchedule matchSchedule;

    @Column(name = "selected_team", nullable = false)
    private Integer selectedTeam; // 0: 홈팀, 1: 원정팀

    @Column(name = "bet_amount", nullable = false)
    private Long betAmount; // 배팅 금액

    @Column(name = "odds", nullable = false)
    private Double odds; // 배당률 (배팅 당시의 배당률)

    @Column(name = "expected_return", nullable = false)
    private Long expectedReturn; // 예상 수익

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private BettingStatus status = BettingStatus.PENDING;

    @Column(name = "actual_return")
    private Long actualReturn; // 실제 수익 (결과 확정 후)

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // 비즈니스 메소드
    public void cancel() {
        if (this.status != BettingStatus.PENDING) {
            throw new IllegalStateException("대기중인 배팅만 취소할 수 있습니다.");
        }
        this.status = BettingStatus.CANCELLED;
    }

    public void win(Long actualReturn) {
        if (this.status != BettingStatus.PENDING) {
            throw new IllegalStateException("대기중인 배팅만 결과를 확정할 수 있습니다.");
        }
        this.status = BettingStatus.WIN;
        this.actualReturn = actualReturn;
    }

    public void lose() {
        if (this.status != BettingStatus.PENDING) {
            throw new IllegalStateException("대기중인 배팅만 결과를 확정할 수 있습니다.");
        }
        this.status = BettingStatus.LOSE;
        this.actualReturn = 0L;
    }

    public boolean isPending() {
        return this.status == BettingStatus.PENDING;
    }
}

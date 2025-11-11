package com.ssafy.yammy.predict.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "predicted_matches", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = "match_id"),  // match_schedule ID 중복 방지
           @UniqueConstraint(columnNames = {"home", "away"})  // 홈팀-원정팀 조합 중복 방지
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictedMatches {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", referencedColumnName = "id")
    private PredictMatchSchedule matchSchedule; // match_schedule 테이블 참조

    @Column(name = "home", length = 10)
    private String home;

    @Column(name = "away", length = 10) 
    private String away;

    @Column(name = "result")
    private Integer result; // 0: 홈팀 승, 1: 원정팀 승, null: 경기 진행 중

    @Column(name = "home_amount")
    @Builder.Default
    private Long homeAmount = 0L; // 홈팀 총 배팅 금액

    @Column(name = "away_amount")
    @Builder.Default
    private Long awayAmount = 0L; // 원정팀 총 배팅 금액

    @Column(name = "home_odds")
    @Builder.Default
    private Double homeOdds = 1.0; // 홈팀 배당률

    @Column(name = "away_odds")
    @Builder.Default 
    private Double awayOdds = 1.0; // 원정팀 배당률

    @Column(name = "is_settled")
    @Builder.Default
    private Integer isSettled = 0; // 정산 여부 (0: 정산 전, 1: 정산 완료)

    /**
     * 홈팀 배팅 금액 추가
     */
    public void addHomeBetAmount(Long amount) {
        this.homeAmount += amount;
    }

    /**
     * 원정팀 배팅 금액 추가
     */
    public void addAwayBetAmount(Long amount) {
        this.awayAmount += amount;
    }

    /**
     * 배당률 업데이트
     */
    public void updateOdds(Double homeOdds, Double awayOdds) {
        this.homeOdds = homeOdds;
        this.awayOdds = awayOdds;
    }

    /**
     * 경기 정산
     */
    public void settleMatch(Integer result) {
        this.result = result;
        this.isSettled = 1;
    }
}

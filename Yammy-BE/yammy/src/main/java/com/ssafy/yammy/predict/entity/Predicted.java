package com.ssafy.yammy.predict.entity;

import com.ssafy.yammy.auth.entity.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "predicted")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Predicted {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", referencedColumnName = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "predicted_match_id", referencedColumnName = "id")
    private PredictedMatches predictedMatch; // predicted_matches 테이블 참조

    @Column(name = "predict")
    private Integer predict; // 0: 홈팀, 1: 원정팀

    @Column(name = "bat_amount")
    private Long batAmount;

    @Column(name = "payback_amount")
    private Long paybackAmount;

    @Column(name = "is_settled")
    @Builder.Default
    private Integer isSettled = 0; // 정산 여부 (0: 정산 전, 1: 정산 완료)

    /**
     * 배팅 정산
     */
    public void settle() {
        this.isSettled = 1;
    }

    /**
     * 정산 여부 확인
     */
    public boolean isSettled() {
        return this.isSettled == 1;
    }
}

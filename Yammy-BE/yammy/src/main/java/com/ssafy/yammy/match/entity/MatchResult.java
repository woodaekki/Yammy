package com.ssafy.yammy.match.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "match_result")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchResult {

    @Id
    @Column(name = "matchcode", length = 20)
    private String matchcode;

    // 필요에 따라 추가적인 필드들을 추가할 수 있습니다
    // 예: 경기 결과, 점수 등
}

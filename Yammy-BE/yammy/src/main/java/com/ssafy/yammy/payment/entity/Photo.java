package com.ssafy.yammy.payment.entity;

import com.ssafy.yammy.auth.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@Table(name = "photo")
public class Photo {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // DB 저장용 URL
    @Column(nullable = false, length = 500)
    private String fileUrl;

    // S3 내부 key (파일 경로)
    @Column(nullable = false, unique = true, length = 300)
    private String s3Key;

    // 이미지 확장자 타입
    @Column(nullable = false, length = 100)
    private String contentType;

    @CreatedDate
    @Column(updatable = false) // 수정 불가능
    private LocalDateTime createdAt;

    // 게시물 번호 외래 키
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private UsedItem usedItem;

    // Photo(자식)에서 UsedItem(부모)로 연결
    public void assignUsedItem(UsedItem usedItem) {
        this.usedItem = usedItem;
    }

}

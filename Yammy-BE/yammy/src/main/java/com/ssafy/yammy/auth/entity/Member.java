package com.ssafy.yammy.auth.entity;

import com.ssafy.yammy.payment.entity.Point;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    public enum Authority {
        ADMIN, USER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long memberId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Authority authority;

    @Column(nullable = false, length = 20)
    private String name;

    @Column(nullable = false, length = 20, unique = true)
    private String nickname;

    @Column(nullable = false, length = 20, unique = true)
    private String id;  // 로그인 ID

    @Column(name = "pw", nullable = false, length = 255)
    private String password;  // BCrypt 암호화

    @Column(nullable = false, length = 50, unique = true)
    private String email;

    @Column(nullable = false)
    @Builder.Default
    private Long exp = 0L;

    @Column(nullable = false, length = 20)
    private String team;

    @Column(name = "game_tag", nullable = false)
    @Builder.Default
    private Long gameTag = 0L;

    @Column(length = 50)
    private String bio;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;

    @Column(name = "profile_image", columnDefinition = "TEXT")
    private String profileImage;

    @Column(name = "is_social", nullable = false)
    @Builder.Default
    private Boolean isSocial = false;

    @Column(name = "kakao_id", unique = true)
    private String kakaoId;

    @Column(name = "wallet_address", unique = true, length = 42)
    private String walletAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;  // Soft Delete

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


}

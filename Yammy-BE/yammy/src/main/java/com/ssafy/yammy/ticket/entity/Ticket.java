package com.ssafy.yammy.ticket.entity;

import com.ssafy.yammy.auth.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Long ticketId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // 경기 정보
    @Column(name = "matchcode")
    private String matchcode;  // KBO 경기 코드 (선택사항)

    @Column(nullable = false, length = 100)
    private String game;  // 경기명 (예: 기아 vs 삼성)

    @Column(nullable = false)
    private LocalDate date;  // 경기 날짜

    @Column(nullable = false, length = 100)
    private String location;  // 경기장

    @Column(nullable = false, length = 50)
    private String seat;  // 좌석

    @Column(nullable = false, length = 200)
    private String comment;  // 한줄평

    // 선택 정보
    @Column(length = 50)
    private String type;  // 종목 (야구, 축구 등)

    @Column(name = "away_score")
    private Integer awayScore;  // 원정팀 점수

    @Column(name = "home_score")
    private Integer homeScore;  // 홈팀 점수

    @Column(columnDefinition = "TEXT")
    private String review;  // 상세 리뷰

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;  // S3 사진 URL (NFT 미발급 시)

    @Column(name = "ipfs_image_hash", columnDefinition = "TEXT")
    private String ipfsImageHash;  // IPFS 이미지 해시 (NFT 발급 시)

    @Column(name = "ipfs_metadata_hash", columnDefinition = "TEXT")
    private String ipfsMetadataHash;  // IPFS 메타데이터 해시 (재시도 시 재사용)

    // NFT 관련 필드
    @Column(name = "nft_token_id")
    private Long nftTokenId;  // NFT 토큰 ID

    @Column(name = "nft_minted")
    @Builder.Default
    private Boolean nftMinted = false;  // NFT 발급 여부

    @Column(name = "nft_metadata_uri", columnDefinition = "TEXT")
    private String nftMetadataUri;  // IPFS 메타데이터 URI

    @Column(name = "nft_transaction_hash", columnDefinition = "TEXT")
    private String nftTransactionHash;  // 발급 트랜잭션 해시

    @Column(name = "nft_minted_at")
    private LocalDateTime nftMintedAt;  // NFT 발급 시간

    // 메타데이터
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

    // 수정 메서드
    public void update(String game, LocalDate date, String location, String seat,
                       String comment, String type, Integer awayScore, Integer homeScore,
                       String review, String photoUrl, String matchcode) {
        this.game = game;
        this.date = date;
        this.location = location;
        this.seat = seat;
        this.comment = comment;
        this.type = type;
        this.awayScore = awayScore;
        this.homeScore = homeScore;
        this.review = review;
        if (photoUrl != null) {
            this.photoUrl = photoUrl;
        }
        this.matchcode = matchcode;
    }

    // NFT 발급 완료 메서드
    public void markNftMinted(Long tokenId, String metadataUri, String txHash) {
        this.nftTokenId = tokenId;
        this.nftMinted = true;
        this.nftMetadataUri = metadataUri;
        this.nftTransactionHash = txHash;
        this.nftMintedAt = LocalDateTime.now();
    }
}

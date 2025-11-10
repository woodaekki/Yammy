package com.ssafy.yammy.ticket.dto;

import com.ssafy.yammy.ticket.entity.Ticket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {
    private Long id;
    private String matchcode;
    private String game;
    private LocalDate date;
    private String location;
    private String seat;
    private String comment;
    private String type;
    private Integer awayScore;
    private Integer homeScore;
    private String review;
    private String photoPreview;  // 프론트엔드와 필드명 통일
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // NFT 관련 필드
    private Long nftTokenId;
    private Boolean nftMinted;
    private String nftMetadataUri;
    private String nftTransactionHash;
    private LocalDateTime nftMintedAt;
    private String ipfsImageHash;  // IPFS 이미지 해시

    public static TicketResponse from(Ticket ticket) {
        // IPFS 이미지 해시가 있으면 게이트웨이 URL 생성, 없으면 기존 photoUrl 사용
        String photoUrl = ticket.getIpfsImageHash() != null
                ? "https://gateway.pinata.cloud/ipfs/" + ticket.getIpfsImageHash()
                : ticket.getPhotoUrl();

        return TicketResponse.builder()
                .id(ticket.getTicketId())
                .matchcode(ticket.getMatchcode())
                .game(ticket.getGame())
                .date(ticket.getDate())
                .location(ticket.getLocation())
                .seat(ticket.getSeat())
                .comment(ticket.getComment())
                .type(ticket.getType())
                .awayScore(ticket.getAwayScore())
                .homeScore(ticket.getHomeScore())
                .review(ticket.getReview())
                .photoPreview(photoUrl)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .nftTokenId(ticket.getNftTokenId())
                .nftMinted(ticket.getNftMinted())
                .nftMetadataUri(ticket.getNftMetadataUri())
                .nftTransactionHash(ticket.getNftTransactionHash())
                .nftMintedAt(ticket.getNftMintedAt())
                .ipfsImageHash(ticket.getIpfsImageHash())
                .build();
    }
}

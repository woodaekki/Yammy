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

    public static TicketResponse from(Ticket ticket) {
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
                .photoPreview(ticket.getPhotoUrl())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}

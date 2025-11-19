package com.ssafy.yammy.chatgames.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_room")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String roomKey;  // Firestore 컬렉션 key

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String homeTeam;

    @Column(length = 50)
    private String awayTeam;

    @Column(nullable = false)
    @Builder.Default
    private Boolean doubleHeader = false;

    private LocalDateTime startAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RoomStatus status = RoomStatus.ACTIVE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = RoomStatus.ACTIVE;
        }
    }
}
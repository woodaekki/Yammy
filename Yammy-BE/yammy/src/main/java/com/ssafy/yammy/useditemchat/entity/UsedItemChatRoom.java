package com.ssafy.yammy.useditemchat.entity;

import com.ssafy.yammy.payment.entity.UsedItem;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 중고거래 1:1 채팅방 엔티티
 * - 같은 물품 + 같은 구매자면 기존 채팅방 재사용
 * - Firebase에 실제 메시지 저장
 */
@Entity
@Table(name = "useditem_chat_room")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsedItemChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Firebase 컬렉션 키 (useditem-chats/{roomKey})
     * 형식: "useditem_{itemId}_{buyerId}"
     */
    @Column(unique = true, nullable = false, length = 100)
    private String roomKey;

    /**
     * 판매자 ID
     */
    @Column(nullable = false)
    private Long sellerId;

    /**
     * 구매자 ID
     */
    @Column(nullable = false)
    private Long buyerId;

    /**
     * 채팅방 상태 (ACTIVE, CLOSED)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UsedChatRoomStatus status = UsedChatRoomStatus.ACTIVE;

    /**
     * 생성 시간
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = UsedChatRoomStatus.ACTIVE;
        }
    }


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "useditem_id")
    private UsedItem usedItem;

    /**
     * roomKey 생성 헬퍼 메서드
     */
    public static String generateRoomKey(Long usedItemId, Long buyerId) {
        return String.format("useditem_%d_%d", usedItemId, buyerId);
    }
}

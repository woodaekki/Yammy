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
    @Column(name = "seller_deleted", nullable = false)
    private Boolean sellerDeleted = false;

    @Column(name = "buyer_deleted", nullable = false)
    private Boolean buyerDeleted = false;

    // 판매자가 읽지 않은 메시지 수
    @Column(name = "seller_unread_count", nullable = false)
    private Integer sellerUnreadCount = 0;

    // 구매자가 읽지 않은 메시지 수
    @Column(name = "buyer_unread_count", nullable = false)
    private Integer buyerUnreadCount = 0;

    // 마지막 메시지 시간
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "last_message_content", length = 500)
    private String lastMessageContent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "useditem_id")
    private UsedItem usedItem;

    /**
     * roomKey 생성 헬퍼 메서드
     */
    public static String generateRoomKey(Long usedItemId, Long buyerId) {
        return "useditem_" + java.util.UUID.randomUUID().toString();
    }

    public Boolean getSellerDeleted() {
        return sellerDeleted;
    }

    public void setSellerDeleted(Boolean sellerDeleted) {
        this.sellerDeleted = sellerDeleted;
    }

    public Boolean getBuyerDeleted() {
        return buyerDeleted;
    }

    public void setBuyerDeleted(Boolean buyerDeleted) {
        this.buyerDeleted = buyerDeleted;
    }

    public Integer getSellerUnreadCount() {
        return sellerUnreadCount != null ? sellerUnreadCount : 0;
    }

    public void setSellerUnreadCount(Integer sellerUnreadCount) {
        this.sellerUnreadCount = sellerUnreadCount;
    }

    public Integer getBuyerUnreadCount() {
        return buyerUnreadCount != null ? buyerUnreadCount : 0;
    }

    public void setBuyerUnreadCount(Integer buyerUnreadCount) {
        this.buyerUnreadCount = buyerUnreadCount;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

}



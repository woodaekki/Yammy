package com.ssafy.yammy.useditemchat.dto;

import com.ssafy.yammy.useditemchat.entity.UsedChatRoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 중고거래 채팅방 응답 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsedItemChatRoomResponse {
    
    private Long id;
    private String roomKey;
    private Long usedItemId;
    private Long sellerId;
    private Long buyerId;
    private UsedChatRoomStatus status;
    private LocalDateTime createdAt;
    
    // 추가 물품 정보 (선택적)
    private String itemTitle;
    private String itemImageUrl;
    private Integer itemPrice;
    private String sellerNickname;
    private String buyerNickname;

    // 내가 읽지 않은 메시지 수
    private Integer unreadCount;

    // 마지막 메시지 시간
    private LocalDateTime lastMessageAt;

    // 마지막 메시지 내용
    private String lastMessageContent;
}

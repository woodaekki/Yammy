package com.ssafy.yammy.useditemchat.controller;

import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.chatgames.dto.MessageResponse;
import com.ssafy.yammy.config.CustomUserDetails;
import com.ssafy.yammy.kafka.dto.ChatEvent;
import com.ssafy.yammy.kafka.producer.ChatProducer;
import com.ssafy.yammy.payment.entity.Photo;
import com.ssafy.yammy.payment.entity.UsedItem;
import com.ssafy.yammy.payment.repository.UsedItemRepository;
import com.ssafy.yammy.useditemchat.dto.SendTextMessageRequest;
import com.ssafy.yammy.useditemchat.dto.UsedItemChatRoomResponse;
import com.ssafy.yammy.useditemchat.entity.UsedChatRoomStatus;
import com.ssafy.yammy.useditemchat.entity.UsedItemChatRoom;
import com.ssafy.yammy.useditemchat.repository.UsedItemChatRoomRepository;
import com.ssafy.yammy.useditemchat.service.UsedItemChatRoomService;
import com.ssafy.yammy.useditemchat.service.UsedItemFirebaseChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 중고거래 채팅방 API Controller
 */
@Tag(name = "Used Item Chat", description = "중고거래 채팅방 API")
@RestController
@RequestMapping("/api/useditem/chat")
@RequiredArgsConstructor
public class UsedItemChatController {

    private final UsedItemChatRoomService usedItemChatRoomService;
    private final UsedItemFirebaseChatService usedItemFirebaseChatService;
    private final UsedItemRepository usedItemRepository;
    private final MemberRepository memberRepository;
    private final UsedItemChatRoomRepository usedItemChatRoomRepository;

    private final ChatProducer chatProducer;
    /**
     * 채팅방 생성 또는 기존 방 입장
     * - 같은 물품 + 같은 구매자면 기존 채팅방 반환
     * - 없으면 새로 생성
     */
    @Operation(summary = "채팅방 생성/입장", description = "중고거래 물품에 대한 1:1 채팅방 생성 또는 기존 방 입장")
    @PostMapping("/{usedItemId}")
    public ResponseEntity<UsedItemChatRoomResponse> createOrEnterChatRoom(
            @PathVariable Long usedItemId,
            @AuthenticationPrincipal CustomUserDetails user) throws Exception {

        UsedItemChatRoom chatRoom = usedItemChatRoomService.createOrGetUsedItemChatRoom(
                usedItemId,
                user.getMemberId()
        );

        return ResponseEntity.ok(toResponse(chatRoom));
    }

    /**
     * 내가 참여한 채팅방 목록 조회
     */
    @Operation(summary = "내 채팅방 목록", description = "판매자 또는 구매자로 참여 중인 채팅방 목록")
    @GetMapping("/rooms")
    public ResponseEntity<List<UsedItemChatRoomResponse>> getMyChatRooms(
            @AuthenticationPrincipal CustomUserDetails user) {

        List<UsedItemChatRoom> chatRooms = usedItemChatRoomService.getMyUsedItemChatRooms(
                user.getMemberId()
        );

        List<UsedItemChatRoomResponse> responses = chatRooms.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    /**
     * 특정 채팅방 정보 조회
     */
    @Operation(summary = "채팅방 정보 조회", description = "roomKey로 채팅방 상세 정보 조회")
    @GetMapping("/room/{roomKey}")
    public ResponseEntity<UsedItemChatRoomResponse> getChatRoom(
            @PathVariable String roomKey) {

        UsedItemChatRoom chatRoom = usedItemChatRoomService.getUsedItemChatRoom(roomKey);

        return ResponseEntity.ok(toResponse(chatRoom));
    }

    /**
     * 채팅방 나가기
     */
    @Operation(summary = "채팅방 나가기", description = "중고거래 채팅방 나가기 (양쪽 모두 나가면 완전 삭제)")
    @DeleteMapping("/room/{roomKey}")
    public ResponseEntity<Void> leaveChatRoom(
            @PathVariable String roomKey,
            @AuthenticationPrincipal CustomUserDetails user) throws Exception {

        usedItemChatRoomService.deleteUsedItemChatRoom(roomKey, user.getMemberId());
        return ResponseEntity.noContent().build();
    }
    /**
     * 채팅방 메시지 읽음 처리
     */
    @Operation(summary = "메시지 읽음 처리", description = "채팅방 입장 시 읽지 않은 메시지 초기화")
    @PostMapping("/room/{roomKey}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String roomKey,
            @AuthenticationPrincipal CustomUserDetails user) throws Exception {

        usedItemChatRoomService.markAsRead(roomKey, user.getMemberId());
        return ResponseEntity.ok().build();
    }

    /**
     * 채팅방에 이미지 업로드
     */
    @Operation(summary = "이미지 업로드", description = "중고거래 채팅방에 이미지 전송")
    @PostMapping(value = "/room/{roomKey}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessageResponse> uploadImage(
            @PathVariable String roomKey,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestPart("file") MultipartFile file) throws Exception {

        // 방 상태 확인
        UsedItemChatRoom room = usedItemChatRoomService.getUsedItemChatRoom(roomKey);
        if (room.getStatus() != UsedChatRoomStatus.ACTIVE) {
            throw new IllegalStateException("채팅방이 활성화 상태가 아닙니다.");
        }
        // 한쪽이라도 나간 경우 메시지 전송 불가
        if (room.getSellerDeleted() || room.getBuyerDeleted()) {
            throw new IllegalStateException("채팅방을 나간 사용자가 있어 메시지를 전송할 수 없습니다.");
        }

        // 이미지 업로드
        String imageUrl = usedItemFirebaseChatService.uploadUsedItemChatImage(
                roomKey,
                user.getMemberId(),
                file
        );

        // Kafka 이벤트 발행
        ChatEvent event = ChatEvent.builder()
                .chatType("USED_ITEM")
                .roomKey(roomKey)
                .senderId(user.getMemberId())
                .senderNickname(user.getNickname())
                .messageType("IMAGE")
                .content(imageUrl)
                .timestamp(LocalDateTime.now())
                .build();

        chatProducer.send(event);

        return ResponseEntity.ok(new MessageResponse("processing", imageUrl));
    }

    /**
     * 채팅방에 텍스트 메시지 전송
     */
    @Operation(summary = "텍스트 메시지 전송", description = "중고거래 채팅방에 텍스트 메시지 전송")
    @PostMapping("/room/{roomKey}/messages")
    public ResponseEntity<MessageResponse> sendTextMessage(
            @PathVariable String roomKey,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody SendTextMessageRequest request) throws Exception {

        // 방 상태 확인
        UsedItemChatRoom room = usedItemChatRoomService.getUsedItemChatRoom(roomKey);
        if (room.getStatus() != UsedChatRoomStatus.ACTIVE) {
            throw new IllegalStateException("채팅방이 활성화 상태가 아닙니다.");
        }

        // 한쪽이라도 나간 경우 메시지 전송 불가
        if (room.getSellerDeleted() || room.getBuyerDeleted()) {
            throw new IllegalStateException("채팅방을 나간 사용자가 있어 메시지를 전송할 수 없습니다.");
        }

        // Kafka 이벤트 발행 (빠름)
        ChatEvent event = ChatEvent.builder()
                .chatType("USED_ITEM")
                .roomKey(roomKey)
                .senderId(user.getMemberId())
                .senderNickname(user.getNickname())
                .messageType("TEXT")
                .content(request.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        chatProducer.send(event);

        // 즉시 응답
        return ResponseEntity.ok(new MessageResponse("processing", null));
    }

    /**
     * 전체 읽지 않은 메시지 수 조회
     */
    @Operation(summary = "전체 읽지 않은 메시지 수", description = "모든 채팅방의 읽지 않은 메시지 합계")
    @GetMapping("/unread-total")
    public ResponseEntity<Map<String, Integer>> getTotalUnreadCount(
            @AuthenticationPrincipal CustomUserDetails user) {

        Integer totalUnread = usedItemChatRoomRepository.getTotalUnreadCount(user.getMemberId());
        return ResponseEntity.ok(Map.of("totalUnread", totalUnread));
    }

    /**
     * Entity를 Response DTO로 변환
     */
    private UsedItemChatRoomResponse toResponse(UsedItemChatRoom chatRoom) {
        UsedItemChatRoomResponse.UsedItemChatRoomResponseBuilder builder = UsedItemChatRoomResponse.builder()
                .id(chatRoom.getId())
                .roomKey(chatRoom.getRoomKey())
                .usedItemId(chatRoom.getUsedItem() != null ? chatRoom.getUsedItem().getId() : null)
                .sellerId(chatRoom.getSellerId())
                .buyerId(chatRoom.getBuyerId())
                .status(chatRoom.getStatus())
                .createdAt(chatRoom.getCreatedAt())
                .lastMessageAt(chatRoom.getLastMessageAt());

        // 현재 사용자의 읽지 않은 메시지 수 설정
        // SecurityContext에서 현재 사용자 ID 가져와서 설정
        // (여기서는 양쪽 정보를 모두 보내고, 프론트에서 판단하도록 함)
        Long currentUserId = getCurrentUserId(); // SecurityContext에서 가져오기
        if (currentUserId != null) {
            if (chatRoom.getSellerId().equals(currentUserId)) {
                builder.unreadCount(chatRoom.getSellerUnreadCount());
            } else if (chatRoom.getBuyerId().equals(currentUserId)) {
                builder.unreadCount(chatRoom.getBuyerUnreadCount());
            }
        }

        // 중고거래 물품 정보 조회 및 추가
        UsedItem usedItem = chatRoom.getUsedItem();
        if (usedItem != null) {
            builder.itemTitle(usedItem.getTitle());
            builder.itemPrice(usedItem.getPrice());

            // 첫 번째 이미지 URL 추가
            List<Photo> photos = usedItem.getPhotos();
            if (photos != null && !photos.isEmpty()) {
                builder.itemImageUrl(photos.get(0).getFileUrl());
            }
        }

        // 추가: 판매자/구매자 닉네임 조회
        memberRepository.findById(chatRoom.getSellerId()).ifPresent(seller -> {
            builder.sellerNickname(seller.getNickname());
        });

        memberRepository.findById(chatRoom.getBuyerId()).ifPresent(buyer -> {
            builder.buyerNickname(buyer.getNickname());
        });


        return builder.build();
    }

    // SecurityContext에서 현재 사용자 ID 가져오는 헬퍼 메서드
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) authentication.getPrincipal()).getMemberId();
        }
        return null;
    }
}

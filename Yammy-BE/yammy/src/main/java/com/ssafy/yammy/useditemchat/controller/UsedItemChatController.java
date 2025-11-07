package com.ssafy.yammy.useditemchat.controller;

import com.ssafy.yammy.chatgames.dto.MessageResponse;
import com.ssafy.yammy.config.CustomUserDetails;
import com.ssafy.yammy.useditemchat.dto.SendTextMessageRequest;
import com.ssafy.yammy.useditemchat.dto.UsedItemChatRoomResponse;
import com.ssafy.yammy.useditemchat.entity.UsedChatRoomStatus;
import com.ssafy.yammy.useditemchat.entity.UsedItemChatRoom;
import com.ssafy.yammy.useditemchat.service.UsedItemChatRoomService;
import com.ssafy.yammy.useditemchat.service.UsedItemFirebaseChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
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

        // 이미지 업로드
        String imageUrl = usedItemFirebaseChatService.uploadUsedItemChatImage(
                roomKey,
                user.getMemberId(),
                file
        );

        // Firestore 메시지 저장
        String messageId = usedItemFirebaseChatService.saveUsedItemChatMessage(
                roomKey,
                user.getMemberId(),
                user.getNickname(),
                imageUrl
        );

        return ResponseEntity.ok(new MessageResponse(messageId, imageUrl));
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

        // Firestore 메시지 저장
        String messageId = usedItemFirebaseChatService.saveUsedItemChatTextMessage(
                roomKey,
                user.getMemberId(),
                user.getNickname(),
                request.getMessage()
        );

        return ResponseEntity.ok(new MessageResponse(messageId, null));
    }

    /**
     * Entity를 Response DTO로 변환
     */
    private UsedItemChatRoomResponse toResponse(UsedItemChatRoom chatRoom) {
        return UsedItemChatRoomResponse.builder()
                .id(chatRoom.getId())
                .roomKey(chatRoom.getRoomKey())
                .usedItemId(chatRoom.getUsedItemId())
                .sellerId(chatRoom.getSellerId())
                .buyerId(chatRoom.getBuyerId())
                .status(chatRoom.getStatus())
                .createdAt(chatRoom.getCreatedAt())
                // TODO: 물품 정보 조회해서 추가 (itemTitle, itemImageUrl 등)
                .build();
    }
}

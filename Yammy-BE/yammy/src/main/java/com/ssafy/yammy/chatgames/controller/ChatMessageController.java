package com.ssafy.yammy.chatgames.controller;

import com.ssafy.yammy.chatgames.dto.MessageResponse;
import com.ssafy.yammy.chatgames.entity.ChatRoom;
import com.ssafy.yammy.chatgames.entity.RoomStatus;
import com.ssafy.yammy.chatgames.service.ChatRoomService;
import com.ssafy.yammy.chatgames.service.FirebaseChatService;
import com.ssafy.yammy.config.CustomUserDetails;
import com.ssafy.yammy.kafka.dto.ChatEvent;
import com.ssafy.yammy.kafka.producer.ChatProducer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Tag(name = "Chat Message", description = "채팅 메시지 API")
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatRoomService chatRoomService;
    private final FirebaseChatService firebaseChatService;
    private final ChatProducer chatProducer;

    @Operation(summary = "활성화된 채팅방 목록 조회", description = "ACTIVE 상태인 채팅방 목록 반환")
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoom>> getActiveRooms() {
        List<ChatRoom> rooms = chatRoomService.getActiveRooms();
        return ResponseEntity.ok(rooms);
    }

    @Operation(summary = "채팅방 단건 조회", description = "roomKey로 특정 채팅방 정보 조회")
    @GetMapping("/rooms/{roomKey}")
    public ResponseEntity<ChatRoom> getRoomByKey(@PathVariable String roomKey) {
        ChatRoom room = chatRoomService.findByRoomKey(roomKey);
        return ResponseEntity.ok(room);
    }

    @Operation(summary = "이미지 업로드", description = "채팅방에 이미지 전송")
    @PostMapping(value = "/rooms/{roomKey}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessageResponse> uploadImage(
            @PathVariable String roomKey,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestPart("file") MultipartFile file) throws Exception {

        // 방 상태 확인
        ChatRoom room = chatRoomService.findByRoomKey(roomKey);
        if (room.getStatus() != RoomStatus.ACTIVE) {
            throw new IllegalStateException("채팅방이 활성화 상태가 아닙니다.");
        }

        // 이미지 업로드
        String imageUrl = firebaseChatService.uploadImage(
                roomKey,
                user.getMemberId(),  // ← CustomUserDetails에서 확인한 정확한 메서드
                file
        );

        // Kafka 이벤트 발행 (비동기)
        ChatEvent event = ChatEvent.builder()
                .chatType("CHEERUP")  // ← 응원 채팅
                .roomKey(roomKey)
                .senderId(user.getMemberId())
                .senderNickname(user.getNickname())
                .messageType("IMAGE")
                .content(imageUrl)
                .timestamp(LocalDateTime.now())
                .build();

        chatProducer.send(event);

        // 즉시 응답
        return ResponseEntity.ok(new MessageResponse("processing", imageUrl));
    }
}
package com.ssafy.yammy.chatgames.controller;

import com.ssafy.yammy.chatgames.dto.MessageResponse;
import com.ssafy.yammy.chatgames.entity.ChatRoom;
import com.ssafy.yammy.chatgames.entity.RoomStatus;
import com.ssafy.yammy.chatgames.service.ChatRoomService;
import com.ssafy.yammy.chatgames.service.FirebaseChatService;
import com.ssafy.yammy.config.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Chat Message", description = "채팅 메시지 API")
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatRoomService chatRoomService;
    private final FirebaseChatService firebaseChatService;

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

        // Firestore 메시지 저장
        String messageId = firebaseChatService.saveMessage(
                roomKey,
                user.getMemberId(),
                imageUrl
        );

        return ResponseEntity.ok(new MessageResponse(messageId, imageUrl));
    }
}
package com.ssafy.yammy.chatgames.controller;

import com.ssafy.yammy.chatgames.dto.CreateRoomRequest;
import com.ssafy.yammy.chatgames.entity.ChatRoom;
import com.ssafy.yammy.chatgames.entity.RoomStatus;
import com.ssafy.yammy.chatgames.service.ChatRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Chat Room Admin", description = "채팅방 관리자 API")
@RestController
@RequestMapping("/api/admin/chat-rooms")
@RequiredArgsConstructor
public class ChatRoomAdminController {

    private final ChatRoomService chatRoomService;

    @Operation(summary = "채팅방 생성", description = "관리자가 새 채팅방 생성")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ChatRoom> createRoom(@RequestBody CreateRoomRequest request) throws Exception {
        ChatRoom room = chatRoomService.createRoom(request);
        return ResponseEntity.ok(room);
    }

    @Operation(summary = "채팅방 상태 변경", description = "DRAFT/ACTIVE/CANCELED 상태 변경")
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam RoomStatus status) throws Exception {
        chatRoomService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "채팅방 삭제", description = "MySQL + Firestore에서 삭제")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) throws Exception {
        chatRoomService.deleteRoom(id);
        return ResponseEntity.ok().build();
    }
}
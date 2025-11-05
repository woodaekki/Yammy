package com.ssafy.yammy.chatgames.service;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.Timestamp;
import com.google.firebase.cloud.FirestoreClient;
import com.ssafy.yammy.chatgames.dto.CreateRoomRequest;
import com.ssafy.yammy.chatgames.entity.ChatRoom;
import com.ssafy.yammy.chatgames.entity.RoomStatus;
import com.ssafy.yammy.chatgames.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    @Transactional
    public ChatRoom createRoom(CreateRoomRequest request) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        // roomKey 생성 (없으면 UUID)
        String roomKey = (request.getRoomKey() != null && !request.getRoomKey().isBlank())
                ? request.getRoomKey()
                : UUID.randomUUID().toString();

        // MySQL 저장
        ChatRoom chatRoom = ChatRoom.builder()
                .roomKey(roomKey)
                .name(request.getName())
                .homeTeam(request.getHomeTeam())
                .awayTeam(request.getAwayTeam())
                .doubleHeader(request.getDoubleHeader() != null ? request.getDoubleHeader() : false)
                .startAt(request.getStartAt())
                .status(RoomStatus.DRAFT)
                .build();

        ChatRoom saved = chatRoomRepository.save(chatRoom);
        log.info("Created chat room: {}", saved.getRoomKey());

        // Firestore 동기화
        Map<String, Object> firestoreData = new HashMap<>();
        firestoreData.put("name", saved.getName());
        firestoreData.put("homeTeam", saved.getHomeTeam() != null ? saved.getHomeTeam() : "");
        firestoreData.put("awayTeam", saved.getAwayTeam() != null ? saved.getAwayTeam() : "");
        firestoreData.put("doubleHeader", saved.getDoubleHeader());
        firestoreData.put("status", saved.getStatus().name());
        firestoreData.put(
                "startAt",
                saved.getStartAt() != null
                        ? Timestamp.of(java.util.Date.from(saved.getStartAt().toInstant(ZoneOffset.UTC)))
                        : Timestamp.now()
        );
        firestoreData.put("createdAt", Timestamp.now());

        firestore.collection("chatRooms")
                .document(saved.getRoomKey())
                .set(firestoreData)
                .get();

        log.info("Synced to Firestore: {}", saved.getRoomKey());
        return saved;
    }

    @Transactional
    public void updateStatus(Long id, RoomStatus status) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        ChatRoom room = chatRoomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        room.setStatus(status);
        chatRoomRepository.save(room);

        // Firestore 동기화
        firestore.collection("chatRooms")
                .document(room.getRoomKey())
                .update("status", status.name())
                .get();

        log.info("Updated room status: {} -> {}", room.getRoomKey(), status);
    }

    @Transactional
    public void deleteRoom(Long id) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        ChatRoom room = chatRoomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        // Firestore 삭제
        firestore.collection("chatRooms")
                .document(room.getRoomKey())
                .delete()
                .get();

        // MySQL 삭제
        chatRoomRepository.delete(room);

        log.info("Deleted room: {}", room.getRoomKey());
    }

    public ChatRoom findByRoomKey(String roomKey) {
        return chatRoomRepository.findByRoomKey(roomKey)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다: " + roomKey));
    }

    public List<ChatRoom> getActiveRooms() {
        return chatRoomRepository.findByStatus(RoomStatus.ACTIVE);
    }

}
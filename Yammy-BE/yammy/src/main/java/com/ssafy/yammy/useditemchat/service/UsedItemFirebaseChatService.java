package com.ssafy.yammy.useditemchat.service;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import com.ssafy.yammy.useditemchat.entity.UsedItemChatRoom;
import com.ssafy.yammy.useditemchat.repository.UsedItemChatRoomRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * 중고거래 채팅 Firebase 서비스
 * - Firebase Storage: 이미지 업로드
 * - Firestore: 메시지 저장
 */
@Slf4j
@Service
public class UsedItemFirebaseChatService {

    private final UsedItemChatRoomRepository usedItemChatRoomRepository;

    public UsedItemFirebaseChatService(UsedItemChatRoomRepository usedItemChatRoomRepository) {
        this.usedItemChatRoomRepository = usedItemChatRoomRepository;
    }

    /**
     * Firebase Storage에 이미지 업로드
     * @return Signed URL (1일 만료)
     */
    public String uploadUsedItemChatImage(String roomKey, Long memberId, MultipartFile file) throws IOException {
        Bucket bucket = StorageClient.getInstance().bucket();

        String path = String.format("usedItemChatImages/%s/%s/%d_%s",
                roomKey, memberId, System.currentTimeMillis(), file.getOriginalFilename());

        Blob blob = bucket.create(path, file.getBytes(), file.getContentType());

        // 7일 만료 Signed URL 생성
        String imageUrl = blob.signUrl(7, TimeUnit.DAYS).toString();

        return imageUrl;
    }

    /**
     * Firestore에 메시지 저장 (useditem-chats 컬렉션)
     * @return 생성된 메시지 ID
     */
    public String saveUsedItemChatMessage(String roomKey, Long memberId, String nickname, String imageUrl) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        var docRef = firestore.collection("useditem-chats")
                .document(roomKey)
                .collection("messages")
                .add(Map.of(
                        "uid", memberId.toString(),
                        "nickname", nickname,
                        "type", "image",
                        "imageUrl", imageUrl,
                        "createdAt", Timestamp.now()
                ))
                .get();

        log.info("✅ Used item chat message saved: {} in room: {}", docRef.getId(), roomKey);

        // 상대방의 unread count 증가
        updateUnreadCount(roomKey, memberId);

        return docRef.getId();
    }

    /**
     * Firestore에 텍스트 메시지 저장
     * @return 생성된 메시지 ID
     */
    public String saveUsedItemChatTextMessage(String roomKey, Long memberId, String nickname, String message) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        // 메시지 저장
        var docRef = firestore.collection("useditem-chats")
                .document(roomKey)
                .collection("messages")
                .add(Map.of(
                        "uid", memberId.toString(),
                        "nickname", nickname,
                        "type", "text",
                        "message", message,
                        "createdAt", Timestamp.now()
                ))
                .get();

        log.info("✅ Used item chat text message saved: {} in room: {}", docRef.getId(), roomKey);

        // 상대방의 unread count 증가
        updateUnreadCount(roomKey, memberId);

        return docRef.getId();
    }

    /**
     * 읽지 않은 메시지 수 증가
     * - 발신자가 판매자면 구매자의 unreadCount 증가
     * - 발신자가 구매자면 판매자의 unreadCount 증가
     */
    private void updateUnreadCount(String roomKey, Long senderId) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        // 1. MySQL 업데이트
        UsedItemChatRoom room = usedItemChatRoomRepository.findByRoomKey(roomKey)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        if (senderId.equals(room.getSellerId())) {
            room.setBuyerUnreadCount(room.getBuyerUnreadCount() + 1);
        } else if (senderId.equals(room.getBuyerId())) {
            room.setSellerUnreadCount(room.getSellerUnreadCount() + 1);
        }
        room.setLastMessageAt(LocalDateTime.now());
        usedItemChatRoomRepository.save(room);

        // 2. Firestore 동기화
        var roomRef = firestore.collection("useditem-chats").document(roomKey);
        var roomSnapshot = roomRef.get().get();
        if (roomSnapshot.exists()) {
            Long sellerId = roomSnapshot.getLong("sellerId");
            Long buyerId = roomSnapshot.getLong("buyerId");

            if (senderId.equals(sellerId)) {
                Long currentCount = roomSnapshot.getLong("buyerUnreadCount");
                roomRef.update(
                        "buyerUnreadCount", (currentCount != null ? currentCount : 0) + 1,
                        "lastMessageAt", Timestamp.now()
                ).get();
            } else if (senderId.equals(buyerId)) {
                Long currentCount = roomSnapshot.getLong("sellerUnreadCount");
                roomRef.update(
                        "sellerUnreadCount", (currentCount != null ? currentCount : 0) + 1,
                        "lastMessageAt", Timestamp.now()
                ).get();
            }
        }
    }

    /**
     * Firestore에 에스크로 메시지 저장
     * @return 생성된 메시지 ID
     */
    public String saveEscrowMessage(String roomKey, Long fromMemberId, String nickname, Long escrowId, Long amount) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        var docRef = firestore.collection("useditem-chats")
                .document(roomKey)
                .collection("messages")
                .add(Map.of(
                        "uid", fromMemberId.toString(),
                        "nickname", nickname,
                        "type", "escrow",
                        "escrowId", escrowId,
                        "amount", amount,
                        "status", "pending",
                        "createdAt", Timestamp.now()
                ))
                .get();

        return docRef.getId();
    }

    /**
     * Firestore에서 에스크로 메시지 상태 업데이트
     */
    public void updateEscrowMessageStatus(String roomKey, Long escrowId, String status) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        Query query = firestore
                .collection("useditem-chats")
                .document(roomKey)
                .collection("messages")
                .whereEqualTo("type", "escrow")
                .whereEqualTo("escrowId", escrowId)
                .limit(1);

        var documents = query.get().get().getDocuments();

        if (!documents.isEmpty()) {
            documents.get(0).getReference().update(Map.of(
                    "status", status,
                    "completedAt", Timestamp.now()
            )).get();
        } else {
            log.warn("Escrow message not found: escrowId={}", escrowId);
        }
    }
}

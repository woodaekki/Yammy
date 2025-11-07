package com.ssafy.yammy.useditemchat.service;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    /**
     * Firebase Storage에 이미지 업로드
     * @return Signed URL (1일 만료)
     */
    public String uploadUsedItemChatImage(String roomKey, Long memberId, MultipartFile file) throws IOException {
        Bucket bucket = StorageClient.getInstance().bucket();

        String path = String.format("usedItemChatImages/%s/%s/%d_%s",
                roomKey, memberId, System.currentTimeMillis(), file.getOriginalFilename());

        Blob blob = bucket.create(path, file.getBytes(), file.getContentType());

        // 1일 만료 Signed URL 생성
        String imageUrl = blob.signUrl(1, TimeUnit.DAYS).toString();

        log.info("✅ Used item chat image uploaded: {} (size: {} bytes)", path, file.getSize());
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
        return docRef.getId();
    }

    /**
     * Firestore에 텍스트 메시지 저장
     * @return 생성된 메시지 ID
     */
    public String saveUsedItemChatTextMessage(String roomKey, Long memberId, String nickname, String message) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

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
        return docRef.getId();
    }
}

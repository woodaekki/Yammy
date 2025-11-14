package com.ssafy.yammy.chatgames.service;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.cloud.Timestamp;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class FirebaseChatService {

    /**
     * Firebase Storage에 이미지 업로드
     * @return Signed URL (1일 만료)
     */
    public String uploadImage(String roomKey, Long memberId, MultipartFile file) throws IOException {
        Bucket bucket = StorageClient.getInstance().bucket();

        String path = String.format("chatImages/%s/%s/%d_%s",
                roomKey, memberId, System.currentTimeMillis(), file.getOriginalFilename());

        Blob blob = bucket.create(path, file.getBytes(), file.getContentType());

        // 1일 만료 Signed URL 생성
        String imageUrl = blob.signUrl(7, TimeUnit.DAYS).toString();

        log.info("Image uploaded: {} (size: {} bytes)", path, file.getSize());
        return imageUrl;
    }

    /**
     * Firestore에 메시지 저장
     * @return 생성된 메시지 ID
     */
    public String saveMessage(String roomKey, Long memberId, String nickname,String imageUrl) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        var docRef = firestore.collection("chatRooms")
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

        log.info("Message saved: {} in room: {}", docRef.getId(), roomKey);
        return docRef.getId();
    }
}
package com.ssafy.yammy.useditemchat.service;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import com.ssafy.yammy.payment.entity.UsedItem;
import com.ssafy.yammy.payment.repository.UsedItemRepository;
import com.ssafy.yammy.useditemchat.entity.UsedChatRoomStatus;
import com.ssafy.yammy.useditemchat.entity.UsedItemChatRoom;
import com.ssafy.yammy.useditemchat.repository.UsedItemChatRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 중고거래 채팅방 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UsedItemChatRoomService {

    private final UsedItemChatRoomRepository usedItemChatRoomRepository;
    private final UsedItemRepository usedItemRepository;

    /**
     * 중고거래 채팅방 생성 또는 기존 방 반환
     * - 같은 물품 + 같은 구매자면 기존 채팅방 재사용
     * - 없으면 새로 생성
     */
    @Transactional
    public UsedItemChatRoom createOrGetUsedItemChatRoom(Long usedItemId, Long buyerId) throws Exception {
        // 1. 물품 존재 확인
        UsedItem usedItem = usedItemRepository.findById(usedItemId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 물품입니다."));

        Long sellerId = usedItem.getMember().getMemberId();

        // 2. 본인 물품인지 확인
        if (sellerId.equals(buyerId)) {
            throw new IllegalArgumentException("본인의 물품에는 채팅할 수 없습니다.");
        }

        // 3. 기존 채팅방 찾기
        return usedItemChatRoomRepository.findByUsedItemIdAndBuyerId(usedItemId, buyerId)
                .orElseGet(() -> {
                    try {
                        return createNewUsedItemChatRoom(usedItemId, sellerId, buyerId);
                    } catch (Exception e) {
                        throw new RuntimeException("채팅방 생성 실패", e);
                    }
                });
    }

    /**
     * 새 중고거래 채팅방 생성 (MySQL + Firebase)
     */
    private UsedItemChatRoom createNewUsedItemChatRoom(Long usedItemId, Long sellerId, Long buyerId) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        // roomKey 생성
        String roomKey = UsedItemChatRoom.generateRoomKey(usedItemId, buyerId);

        // MySQL 저장
        UsedItemChatRoom chatRoom = UsedItemChatRoom.builder()
                .roomKey(roomKey)
                .usedItemId(usedItemId)
                .sellerId(sellerId)
                .buyerId(buyerId)
                .status(UsedChatRoomStatus.ACTIVE)
                .build();

        UsedItemChatRoom saved = usedItemChatRoomRepository.save(chatRoom);
        log.info("✅ Created used item chat room: {}", saved.getRoomKey());

        // Firestore 동기화
        Map<String, Object> firestoreData = new HashMap<>();
        firestoreData.put("usedItemId", saved.getUsedItemId());
        firestoreData.put("sellerId", saved.getSellerId());
        firestoreData.put("buyerId", saved.getBuyerId());
        firestoreData.put("status", saved.getStatus().name());
        firestoreData.put("createdAt", Timestamp.now());

        firestore.collection("useditem-chats")
                .document(saved.getRoomKey())
                .set(firestoreData)
                .get();

        log.info("✅ Synced to Firestore: useditem-chats/{}", saved.getRoomKey());
        return saved;
    }

    /**
     * roomKey로 중고거래 채팅방 조회
     */
    public UsedItemChatRoom getUsedItemChatRoom(String roomKey) {
        return usedItemChatRoomRepository.findByRoomKey(roomKey)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));
    }

    /**
     * 내가 참여한 중고거래 채팅방 목록 (판매자 or 구매자)
     */
    public List<UsedItemChatRoom> getMyUsedItemChatRooms(Long memberId) {
        return usedItemChatRoomRepository.findByMemberId(memberId);
    }

    /**
     * 특정 물품의 중고거래 채팅방 목록 (판매자용)
     */
    public List<UsedItemChatRoom> getUsedItemChatRoomsByItem(Long usedItemId, Long sellerId) {
        return usedItemChatRoomRepository.findByUsedItemIdAndSellerIdOrderByCreatedAtDesc(usedItemId, sellerId);
    }

    /**
     * 중고거래 채팅방 상태 변경
     */
    @Transactional
    public void updateUsedItemChatRoomStatus(String roomKey, UsedChatRoomStatus status) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        UsedItemChatRoom room = getUsedItemChatRoom(roomKey);
        room.setStatus(status);
        usedItemChatRoomRepository.save(room);

        // Firestore 동기화
        firestore.collection("useditem-chats")
                .document(roomKey)
                .update("status", status.name())
                .get();

        log.info("✅ Updated used item chat room status: {} -> {}", roomKey, status);
    }

    /**
     * 중고거래 채팅방 삭제 (MySQL + Firestore)
     */
    @Transactional
    public void deleteUsedItemChatRoom(String roomKey) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        UsedItemChatRoom room = getUsedItemChatRoom(roomKey);

        // Firestore 삭제
        firestore.collection("useditem-chats")
                .document(roomKey)
                .delete()
                .get();

        // MySQL 삭제
        usedItemChatRoomRepository.delete(room);

        log.info("✅ Deleted used item chat room: {}", roomKey);
    }
}

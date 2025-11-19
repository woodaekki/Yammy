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

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
        Optional<UsedItemChatRoom> existingRoom =
                usedItemChatRoomRepository.findByUsedItemIdAndBuyerId(usedItemId, buyerId);

        if (existingRoom.isPresent()) {
            UsedItemChatRoom room = existingRoom.get();

            // 한쪽이라도 나간 상태면 양쪽 플래그 초기화 (채팅 재개)
            if (room.getSellerDeleted() || room.getBuyerDeleted()) {
                room.setSellerDeleted(false);
                room.setBuyerDeleted(false);
                usedItemChatRoomRepository.save(room);

                // Firestore 동기화
                Firestore firestore = FirestoreClient.getFirestore();
                Map<String, Object> updates = new HashMap<>();
                updates.put("sellerDeleted", false);
                updates.put("buyerDeleted", false);

                firestore.collection("useditem-chats")
                        .document(room.getRoomKey())
                        .update(updates)
                        .get();

                log.info("Chat room re-opened: {}", room.getRoomKey());
            }

            return room;
        } else {
            return createNewUsedItemChatRoom(usedItemId, sellerId, buyerId);
        }
    }

    /**
     * 새 중고거래 채팅방 생성 (MySQL + Firebase)
     */
    private UsedItemChatRoom createNewUsedItemChatRoom(Long usedItemId, Long sellerId, Long buyerId) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        // usedItemId를 엔티티로 직접 조회해서 연결
        UsedItem usedItem = usedItemRepository.findById(usedItemId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 물품입니다."));

        // roomKey 생성
        String roomKey = UsedItemChatRoom.generateRoomKey(usedItemId, buyerId);

        // MySQL 저장
        UsedItemChatRoom chatRoom = UsedItemChatRoom.builder()
                .roomKey(roomKey)
                .usedItem(usedItem)
                .sellerId(sellerId)
                .buyerId(buyerId)
                .status(UsedChatRoomStatus.ACTIVE)
                .sellerDeleted(false)
                .buyerDeleted(false)
                .sellerUnreadCount(0)
                .buyerUnreadCount(0)
                .lastMessageContent(null)
                .build();

        UsedItemChatRoom saved = usedItemChatRoomRepository.save(chatRoom);
        log.info("Created used item chat room: {}", saved.getRoomKey());

        // Firestore 동기화
        Map<String, Object> firestoreData = new HashMap<>();
        firestoreData.put("usedItemId", usedItem.getId());
        firestoreData.put("sellerId", saved.getSellerId());
        firestoreData.put("buyerId", saved.getBuyerId());
        firestoreData.put("status", saved.getStatus().name());
        firestoreData.put("sellerDeleted", false);
        firestoreData.put("buyerDeleted", false);
        firestoreData.put("sellerUnreadCount", 0);
        firestoreData.put("buyerUnreadCount", 0);
        firestoreData.put("createdAt", Timestamp.now());

        firestore.collection("useditem-chats")
                .document(saved.getRoomKey())
                .set(firestoreData)
                .get();

        log.info("Synced to Firestore: useditem-chats/{}", saved.getRoomKey());
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
        log.info("[UsedItemChatRoom] Getting chat rooms for memberId: {}", memberId);
        List<UsedItemChatRoom> rooms = usedItemChatRoomRepository.findByMemberId(memberId);
        log.info("[UsedItemChatRoom] Found {} chat rooms", rooms.size());
        return rooms;
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

        log.info("Updated used item chat room status: {} -> {}", roomKey, status);
    }

    /**
     * 중고거래 채팅방 삭제 (MySQL + Firestore)
     */
    @Transactional
    public void deleteUsedItemChatRoom(String roomKey, Long memberId) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        UsedItemChatRoom room = getUsedItemChatRoom(roomKey);

        // 권한 확인
        if(!room.getSellerId().equals(memberId) && !room.getBuyerId().equals(memberId)) {
            throw new IllegalArgumentException("채팅방 나가기 권한이 없습니다.");
        }

        if (room.getSellerId().equals(memberId)) {
            room.setSellerDeleted(true);
        } else {
            room.setBuyerDeleted(true);
        }

        if (room.getSellerDeleted() && room.getBuyerDeleted()) {
            // Firestore 삭제
            firestore.collection("useditem-chats")
                    .document(roomKey)
                    .delete()
                    .get();

            // MySQL 삭제
            usedItemChatRoomRepository.delete(room);

            log.info("Deleted used item chat room: {}", roomKey);
        } else {
            // 한쪽만 나간 경우 플래그만 업데이트
            usedItemChatRoomRepository.save(room);

            // Firestore 동기화
            Map<String, Object> updates = new HashMap<>();
            updates.put("sellerDeleted", room.getSellerDeleted());
            updates.put("buyerDeleted", room.getBuyerDeleted());

            firestore.collection("useditem-chats")
                    .document(roomKey)
                    .update(updates)
                    .get();

            log.info("User {} left chat room: {}", memberId, roomKey);

        }


    }

    /**
     * 채팅방 입장 시 읽지 않은 메시지 초기화
     */
    @Transactional
    public void markAsRead(String roomKey, Long memberId) throws Exception {
        Firestore firestore = FirestoreClient.getFirestore();

        UsedItemChatRoom room = getUsedItemChatRoom(roomKey);

        // 본인의 unread count 초기화
        if (room.getSellerId().equals(memberId)) {
            room.setSellerUnreadCount(0);
        } else if (room.getBuyerId().equals(memberId)) {
            room.setBuyerUnreadCount(0);
        }

        usedItemChatRoomRepository.save(room);

        // Firestore 동기화
        String fieldName = room.getSellerId().equals(memberId) ? "sellerUnreadCount" : "buyerUnreadCount";
        firestore.collection("useditem-chats")
                .document(roomKey)
                .update(fieldName, 0)
                .get();

        log.info("Marked as read: {} by user {}", roomKey, memberId);
    }

    /**
     * 마지막 메시지 내용 업데이트
     */
    @Transactional
    public void updateLastMessageContent(String roomKey, String content) {
        UsedItemChatRoom room = getUsedItemChatRoom(roomKey);
        room.setLastMessageContent(content);
        room.setLastMessageAt(LocalDateTime.now());
        usedItemChatRoomRepository.save(room);
    }


}

package com.ssafy.yammy.useditemchat.repository;

import com.ssafy.yammy.useditemchat.entity.UsedItemChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 중고거래 채팅방 Repository
 */
@Repository
public interface UsedItemChatRoomRepository extends JpaRepository<UsedItemChatRoom, Long> {

    /**
     * roomKey로 채팅방 찾기
     */
    Optional<UsedItemChatRoom> findByRoomKey(String roomKey);

    /**
     * 특정 물품 + 구매자로 채팅방 찾기
     * (같은 물품에 같은 구매자면 기존 채팅방 재사용)
     */
    Optional<UsedItemChatRoom> findByUsedItemIdAndBuyerId(Long usedItemId, Long buyerId);

    /**
     * 내가 참여한 모든 채팅방 목록
     * (판매자 또는 구매자로 참여 중인 방)
     */
    @Query("SELECT c FROM UsedItemChatRoom c WHERE c.sellerId = :memberId OR c.buyerId = :memberId ORDER BY c.createdAt DESC")
    List<UsedItemChatRoom> findByMemberId(@Param("memberId") Long memberId);

    /**
     * 특정 물품의 모든 채팅방 (판매자용)
     * 판매자가 자기 물품에 대한 모든 채팅방 보기
     */
    List<UsedItemChatRoom> findByUsedItemIdAndSellerIdOrderByCreatedAtDesc(Long usedItemId, Long sellerId);

    /**
     * 특정 물품의 모든 채팅방 개수
     */
    long countByUsedItemId(Long usedItemId);
}

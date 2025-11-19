package com.ssafy.yammy.escrow.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.escrow.dto.EscrowResponse;
import com.ssafy.yammy.escrow.entity.Escrow;
import com.ssafy.yammy.escrow.entity.EscrowStatus;
import com.ssafy.yammy.escrow.repository.EscrowRepository;
import com.ssafy.yammy.payment.entity.PointTransaction;
import com.ssafy.yammy.payment.entity.TransactionType;
import com.ssafy.yammy.payment.entity.UsedItem;
import com.ssafy.yammy.payment.entity.UsedItemStatus;
import com.ssafy.yammy.payment.repository.PointTransactionRepository;
import com.ssafy.yammy.payment.service.PointTransactionService;
import com.ssafy.yammy.useditemchat.entity.UsedItemChatRoom;
import com.ssafy.yammy.useditemchat.repository.UsedItemChatRoomRepository;
import com.ssafy.yammy.useditemchat.service.UsedItemFirebaseChatService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EscrowService {

    private final EscrowRepository escrowRepository;
    private final UsedItemChatRoomRepository chatRoomRepository;
    private final MemberRepository memberRepository;
    private final PointTransactionService pointTransactionService;
    private final UsedItemFirebaseChatService firebaseChatService; // Firebase 연동 추가

    // 송금 요청 (에스크로 생성 + Firebase 메시지 전송)
    @Transactional
    public EscrowResponse createEscrow(String roomKey, Long buyerId, Long amount) {
        UsedItemChatRoom room = chatRoomRepository.findByRoomKey(roomKey)
                .orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));
        Member buyer = memberRepository.findById(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("구매자 정보를 찾을 수 없습니다."));
        Member seller = memberRepository.findById(room.getSellerId())
                .orElseThrow(() -> new IllegalArgumentException("판매자 정보를 찾을 수 없습니다."));

        if (buyer.getPoint().getBalance() < amount) {
            throw new IllegalStateException("포인트가 부족합니다.");
        }
        // confirmed면 또 다른 구매자가 송금 버튼을 누르는 순간 막힘
        UsedItem usedItem = room.getUsedItem();
        if (usedItem != null && usedItem.getStatus() == UsedItemStatus.CONFIRMED) {
            throw new IllegalStateException("이미 거래가 완료된 상품입니다.");
        }

        // 에스크로 생성
        Escrow escrow = escrowRepository.save(
                Escrow.builder()
                        .usedItemChatRoom(room)
                        .buyer(buyer)
                        .seller(seller)
                        .amount(amount)
                        .status(EscrowStatus.HOLD)
                        .build()
        );

        // Firebase에 송금 메시지
        try {
            firebaseChatService.saveEscrowMessage(
                    roomKey,
                    buyerId,
                    buyer.getNickname(),
                    escrow.getId(),
                    amount
            );
        } catch (Exception e) {
            log.error("Firebase 송금 메시지 저장 실패: {}", e.getMessage(), e);
        }

        return EscrowResponse.builder()
                .id(escrow.getId())
                .chatRoomId(room.getId())
                .buyerId(buyer.getMemberId())
                .sellerId(seller.getMemberId())
                .amount(amount)
                .status(escrow.getStatus())
                .createdAt(escrow.getCreatedAt())
                .build();
    }

     @Transactional
    public void confirmedEscrow(Long escrowId) {
        Escrow escrow = escrowRepository.findById(escrowId)
                .orElseThrow(() -> new IllegalArgumentException("에스크로 정보 없음"));

        if (escrow.getStatus() != EscrowStatus.HOLD) {
            throw new IllegalStateException("이미 처리된 거래입니다.");
        }
        // confirmed면 다른 한명이 송금 보냈어도 판매자가 못받음
         UsedItemChatRoom chatRoom = escrow.getUsedItemChatRoom();
         if (chatRoom != null && chatRoom.getUsedItem() != null) {
             UsedItem usedItem = chatRoom.getUsedItem();
             if (usedItem.getStatus() == UsedItemStatus.CONFIRMED) {
                 throw new IllegalStateException("이미 거래가 완료된 상품입니다.");
             }
         }

        Member buyer = escrow.getBuyer();
        Member seller = escrow.getSeller();
        Long amount = escrow.getAmount();

        if (buyer.getPoint().getBalance() < amount) {
            throw new IllegalStateException("구매자 포인트가 부족합니다.");
        }

        // 실제 포인트 이동
        buyer.getPoint().decrease(amount);
        seller.getPoint().increase(amount);
        escrow.setStatus(EscrowStatus.CONFIRMED);

         // 거래 완료 시, 연결된 UsedItem 상태 거래 완료로 변경
         //UsedItemChatRoom chatRoom = escrow.getUsedItemChatRoom();
         if (chatRoom != null && chatRoom.getUsedItem() != null) {
             UsedItem usedItem = chatRoom.getUsedItem();
             usedItem.setStatus(UsedItemStatus.CONFIRMED);
         }

         // 거래 로그만 저장 (포인트 변경은 이미 위에서 완료)
         pointTransactionService.recordTransaction(
                 buyer,
                 amount,
                 TransactionType.ESCROW_DEPOSIT,  // 구매자 → 예치
                 buyer.getPoint().getBalance()  // 현재 잔액 전달
         );

         pointTransactionService.recordTransaction(
                 seller,
                 amount,
                 TransactionType.ESCROW_CONFIRMED,  // 판매자 → 수익 지급
                 seller.getPoint().getBalance()  // 현재 잔액 전달
         );

        // Firebase 메시지 상태 업데이트
        try {
            firebaseChatService.updateEscrowMessageStatus(
                    escrow.getUsedItemChatRoom().getRoomKey(),
                    escrow.getId(),
                    "completed"
            );
        } catch (Exception e) {
            log.error("Firebase 메시지 상태 업데이트 실패: {}", e.getMessage(), e);
        }

        log.info("거래 확정 완료 escrowId={} amount={}", escrowId, amount);
    }

    // 거래 취소 (포인트 이동 없이 상태만 변경)
    @Transactional
    public void cancelEscrow(Long escrowId) {
        Escrow escrow = escrowRepository.findById(escrowId)
                .orElseThrow(() -> new IllegalArgumentException("에스크로 정보 없음"));

        if (escrow.getStatus() != EscrowStatus.HOLD) {
            throw new IllegalStateException("이미 처리된 거래입니다.");
        }

        escrow.setStatus(EscrowStatus.CANCELLED);

        // Firebase 메시지 상태 업데이트
        try {
            firebaseChatService.updateEscrowMessageStatus(
                    escrow.getUsedItemChatRoom().getRoomKey(),
                    escrow.getId(),
                    "cancelled"
            );
        } catch (Exception e) {
            log.error("Firebase 메시지 취소 업데이트 실패: {}", e.getMessage(), e);
        }

        log.info(" 거래 취소 완료 escrowId={}", escrowId);
    }
}

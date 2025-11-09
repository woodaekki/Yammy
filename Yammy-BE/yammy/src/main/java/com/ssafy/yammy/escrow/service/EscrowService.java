package com.ssafy.yammy.escrow.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.escrow.dto.EscrowResponse;
import com.ssafy.yammy.escrow.entity.*;
import com.ssafy.yammy.escrow.repository.EscrowRepository;
import com.ssafy.yammy.payment.entity.PointTransaction;
import com.ssafy.yammy.payment.entity.TransactionType;
import com.ssafy.yammy.payment.repository.PointTransactionRepository;
import com.ssafy.yammy.useditemchat.entity.UsedItemChatRoom;
import com.ssafy.yammy.useditemchat.repository.UsedItemChatRoomRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EscrowService {

    private final EscrowRepository escrowRepository;
    private final UsedItemChatRoomRepository chatRoomRepository;
    private final MemberRepository memberRepository;
    private final PointTransactionRepository pointTransactionRepository;

    // 채팅방에서 송금 - 에스크로 예치
    @Transactional
    public EscrowResponse createEscrow(String roomKey, Long buyerId, Long amount) {
        UsedItemChatRoom room = chatRoomRepository.findByRoomKey(roomKey)
                .orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));

        Member buyer = memberRepository.findById(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("구매자 정보를 찾을 수 없습니다."));
        Member seller = memberRepository.findById(room.getSellerId())
                .orElseThrow(() -> new IllegalArgumentException("판매자 정보를 찾을 수 없습니다."));

        // 구매자 포인트 차감
        if (buyer.getPoint().getBalance() < amount)
            throw new IllegalStateException("포인트가 부족합니다.");
        buyer.getPoint().decrease((long) amount);

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

        // 거래 로그 기록
        pointTransactionRepository.save(PointTransaction.builder()
                .member(buyer)
                .amount((long) amount)
                .type(TransactionType.ESCROW_DEPOSIT)
                .build());

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

    // 거래 확정 - 판매자에게 포인트 지급
    @Transactional
    public void confirmedEscrow(Long escrowId) {
        Escrow escrow = escrowRepository.findById(escrowId)
                .orElseThrow(() -> new IllegalArgumentException("에스크로 정보 없음"));

        if (escrow.getStatus() != EscrowStatus.HOLD)
            throw new IllegalStateException("이미 처리된 거래입니다.");

        Member seller = escrow.getSeller();
        seller.getPoint().increase(escrow.getAmount());
        escrow.setStatus(EscrowStatus.RELEASED);

        pointTransactionRepository.save(PointTransaction.builder()
                .member(seller)
                .amount(escrow.getAmount())
                .type(TransactionType.ESCROW_CONFIRMED)
                .build());
    }

    // 거래 취소 - 구매자에게 포인트 환불
    @Transactional
    public void cancelEscrow(Long escrowId) {
        Escrow escrow = escrowRepository.findById(escrowId)
                // IllegalArgumentException enum 변환 실패 시 발생하는 예외
                .orElseThrow(() -> new IllegalArgumentException("에스크로 정보 없음"));

        if (escrow.getStatus() != EscrowStatus.HOLD)
            throw new IllegalStateException("이미 처리된 거래입니다.");

        Member buyer = escrow.getBuyer();
        buyer.getPoint().increase(escrow.getAmount());
        escrow.setStatus(EscrowStatus.CANCELLED);

        pointTransactionRepository.save(PointTransaction.builder()
                .member(buyer)
                .amount(escrow.getAmount())
                .type(TransactionType.ESCROW_CANCEL)
                .build());
    }
}

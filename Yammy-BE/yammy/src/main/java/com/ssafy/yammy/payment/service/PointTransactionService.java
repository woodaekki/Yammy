package com.ssafy.yammy.payment.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.payment.entity.Point;
import com.ssafy.yammy.payment.entity.PointTransaction;
import com.ssafy.yammy.payment.entity.TransactionType;
import com.ssafy.yammy.payment.repository.PointTransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PointTransactionService {

    private final PointTransactionRepository pointTransactionRepository;

    /**
     * 포인트 거래 로그만 기록하는 메서드
     * 실제 포인트 증감은 호출하는 쪽에서 처리 후, 로그만 저장
     */
    @Transactional
    public void recordTransaction(Member member, long amount, TransactionType type, long balanceAfter) {
        Point point = member.getPoint();

        // 거래 로그만 저장 (포인트 증감 로직 제거)
        PointTransaction transaction = PointTransaction.builder()
                .member(member)
                .point(point)
                .amount(amount)
                .type(type)
                .balanceAfter(balanceAfter)
                .createdAt(LocalDateTime.now())
                .build();

        pointTransactionRepository.save(transaction);
    }

    /**
     * 포인트 충전용 메서드 (기존 호환성 유지)
     * 충전은 증감 + 로그를 함께 처리
     */
    @Transactional
    public void recordChargeTransaction(Member member, long amount) {
        Point point = member.getPoint();
        point.increase(amount);
        
        PointTransaction transaction = PointTransaction.builder()
                .member(member)
                .point(point)
                .amount(amount)
                .type(TransactionType.CHARGE)
                .balanceAfter(point.getBalance())
                .createdAt(LocalDateTime.now())
                .build();

        pointTransactionRepository.save(transaction);
    }
}

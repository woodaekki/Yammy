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
     * 모든 포인트 거래 기록을 담당하는 공통 메서드
     * CHARGE, ESCROW_DEPOSIT, ESCROW_CONFIRMED, ESCROW_CANCEL 모두 이 메서드로 통일
     */
    @Transactional
    public void recordTransaction(Member member, long amount, TransactionType type) {

        Point point = member.getPoint();
        long beforeBalance = point.getBalance();

        // 포인트 증감 로직
        switch (type) {

            case CHARGE -> {
                point.increase(amount);
            }

            case ESCROW_DEPOSIT -> {
                if (point.getBalance() < amount) {
                    throw new IllegalStateException("포인트가 부족합니다.");
                }
                point.decrease(amount);  // 예치 -> 차감
            }

            case ESCROW_CONFIRMED -> {
                point.increase(amount); // 판매자 수익 지급
            }

            case ESCROW_CANCEL -> {
                point.increase(amount); // 구매자 환불
            }
        }

        long afterBalance = point.getBalance();

       // 거래 로그 저장
        PointTransaction transaction = PointTransaction.builder()
                .member(member)
                .point(point)
                .amount(amount)
                .type(type)
                .balanceAfter(afterBalance)
                .createdAt(LocalDateTime.now())
                .build();

        pointTransactionRepository.save(transaction);
    }
}

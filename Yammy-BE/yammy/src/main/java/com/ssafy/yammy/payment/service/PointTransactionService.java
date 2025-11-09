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

    // 포인트 증감
    @Transactional
    public void recordTransaction(Member member, long amount, TransactionType type) {
        Point point = member.getPoint();

        // 거래 타입에 따라 포인트 변경
        if (type == TransactionType.CHARGE) {
            point.increase(amount); // 충전

        } else if (type == TransactionType.ESCROW_DEPOSIT) {
            if (point.getBalance() < amount) {
                throw new IllegalStateException("포인트가 부족합니다.");
            }
            point.decrease(amount); // 예치(차감)

        } else if (type == TransactionType.ESCROW_CONFIRMED) {
            point.increase(amount); // 판매자 수익 지급

        } else if (type == TransactionType.ESCROW_CANCEL) {
            point.increase(amount); // 환불
        }

        // 로그 저장
        PointTransaction transaction = PointTransaction.builder()
                .member(member)
                .point(point)
                .amount(amount)
                .type(type)
                .createdAt(LocalDateTime.now())
                .build();

        pointTransactionRepository.save(transaction);
    }
}

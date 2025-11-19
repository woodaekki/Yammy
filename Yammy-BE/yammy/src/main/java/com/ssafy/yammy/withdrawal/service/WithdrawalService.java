package com.ssafy.yammy.withdrawal.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.payment.entity.Point;
import com.ssafy.yammy.payment.entity.PointTransaction;
import com.ssafy.yammy.payment.entity.TransactionType;
import com.ssafy.yammy.payment.repository.PointRepository;
import com.ssafy.yammy.payment.repository.PointTransactionRepository;
import com.ssafy.yammy.withdrawal.dto.WithdrawalRequest;
import com.ssafy.yammy.withdrawal.dto.WithdrawalResponse;
import com.ssafy.yammy.withdrawal.entity.Withdrawal;
import com.ssafy.yammy.withdrawal.entity.WithdrawalStatus;
import com.ssafy.yammy.withdrawal.repository.WithdrawalRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WithdrawalService {

    private final WithdrawalRepository withdrawalRepository;
    private final MemberRepository memberRepository;
    private final PointRepository pointRepository;
    private final PointTransactionRepository pointTransactionRepository;

    @Transactional
    public WithdrawalResponse requestWithdrawal(Long memberId, WithdrawalRequest dto) {

        // 최소 계좌번호 검증
        validateBasicAccount(dto.getBankName(), dto.getAccountNumber());

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));

        Withdrawal withdrawal = new Withdrawal();
        withdrawal.setMember(member);
        withdrawal.setAmount(dto.getAmount());
        withdrawal.setBankName(dto.getBankName());
        withdrawal.setAccountNumber(dto.getAccountNumber());
        withdrawal.setStatus(WithdrawalStatus.REQUESTED);
        withdrawal.setCreatedAt(LocalDateTime.now());

        withdrawalRepository.save(withdrawal);

        // 자동 승인 처리
        withdrawal.setStatus(WithdrawalStatus.APPROVED);
        withdrawal.setUpdatedAt(LocalDateTime.now());

        Point point = pointRepository.findByMember(member)
                .orElseThrow(() -> new RuntimeException("포인트 지갑이 없습니다."));

        // 잔액 부족 시 거절 처리
        if (point.getBalance() < dto.getAmount()) {
            withdrawal.setStatus(WithdrawalStatus.DENIED);
            withdrawal.setDenyReason("포인트 잔액 부족");
            withdrawal.setUpdatedAt(LocalDateTime.now());
            return convertToResponse(withdrawal);
        }

        // 포인트 차감
        long newBalance = point.getBalance() - dto.getAmount();
        point.setBalance(newBalance);

        // 거래 내역 기록
        PointTransaction pointtransaction = new PointTransaction();
        pointtransaction.setMember(member);
        pointtransaction.setPoint(point);
        pointtransaction.setAmount(-dto.getAmount());
        pointtransaction.setBalanceAfter(newBalance);
        pointtransaction.setType(TransactionType.WITHDRAW);
        pointtransaction.setCreatedAt(LocalDateTime.now());
        pointtransaction.setBankName(dto.getBankName());
        pointtransaction.setAccountNumber(dto.getAccountNumber());

        pointTransactionRepository.save(pointtransaction);

        // 완료 처리
        withdrawal.setStatus(WithdrawalStatus.COMPLETED);
        withdrawal.setUpdatedAt(LocalDateTime.now());

        return convertToResponse(withdrawal);
    }

    // 계좌 검증
    private void validateBasicAccount(String bank, String account) {

        if (bank == null || bank.isBlank()) {
            throw new RuntimeException("은행명을 입력해주세요.");
        }

        if (account == null || account.isBlank()) {
            throw new RuntimeException("계좌번호를 입력해주세요.");
        }

        String digits = account.replaceAll("\\D+", "");

        // 계좌번호 최소 6자리 이하일 시
        if (digits.length() < 7) {
            throw new RuntimeException("계좌번호가 너무 짧습니다.");
        }

        // 20자리 이상일 시
        if (digits.length() > 19) {
            throw new RuntimeException("계좌번호 형식이 올바르지 않습니다.");
        }
    }

    private WithdrawalResponse convertToResponse(Withdrawal withdrawal) {
        WithdrawalResponse dto = new WithdrawalResponse();
        dto.setId(withdrawal.getId());
        dto.setStatus(withdrawal.getStatus());
        dto.setAmount(withdrawal.getAmount());
        dto.setBankName(withdrawal.getBankName());
        dto.setAccountNumber(withdrawal.getAccountNumber());
        dto.setDenyReason(withdrawal.getDenyReason());
        dto.setCreatedAt(withdrawal.getCreatedAt());
        dto.setUpdatedAt(withdrawal.getUpdatedAt());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<WithdrawalResponse> getMyWithdrawals(Long memberId) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        List<Withdrawal> list = withdrawalRepository.findByMemberOrderByCreatedAtDesc(member);

        List<WithdrawalResponse> result = new ArrayList<>();
        for (Withdrawal w : list) {
            result.add(convertToResponse(w));
        }

        return result;
    }

}

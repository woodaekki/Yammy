package com.ssafy.yammy.withdrawal.repository;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.withdrawal.entity.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WithdrawalRepository extends JpaRepository<Withdrawal, Long> {
    // 환전 내역 최신순 정렬
    List<Withdrawal> findByMemberOrderByCreatedAtDesc(Member member);
}

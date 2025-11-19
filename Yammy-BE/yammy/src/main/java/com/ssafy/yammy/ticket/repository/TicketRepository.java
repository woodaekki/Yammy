package com.ssafy.yammy.ticket.repository;

import com.ssafy.yammy.ticket.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // 특정 사용자의 티켓 목록 조회 (최신순)
    List<Ticket> findByMember_MemberIdOrderByCreatedAtDesc(Long memberId);

    // 특정 사용자의 티켓 개수
    long countByMember_MemberId(Long memberId);
}

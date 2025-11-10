package com.ssafy.yammy.predict.repository;

import com.ssafy.yammy.predict.entity.Betting;
import com.ssafy.yammy.auth.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BettingRepository extends JpaRepository<Betting, Long> {

    /**
     * 특정 사용자의 배팅 내역 조회 (페이징)
     */
    Page<Betting> findByMemberOrderByCreatedAtDesc(Member member, Pageable pageable);

    /**
     * 특정 사용자의 특정 상태 배팅 내역 조회 (페이징)
     */
    Page<Betting> findByMemberAndStatusOrderByCreatedAtDesc(
        Member member, 
        Betting.BettingStatus status, 
        Pageable pageable
    );

    /**
     * 특정 사용자와 배팅 ID로 배팅 조회 (본인 소유 확인용)
     */
    Optional<Betting> findByIdAndMember(Long id, Member member);

    /**
     * 특정 경기에 대한 모든 대기중인 배팅 조회
     */
    @Query("SELECT b FROM Betting b WHERE b.matchSchedule.id = :matchId AND b.status = 'PENDING'")
    List<Betting> findPendingBettingsByMatchId(@Param("matchId") Long matchId);

    /**
     * 특정 사용자의 총 배팅 수
     */
    long countByMember(Member member);

    /**
     * 특정 사용자의 승리한 배팅 수
     */
    long countByMemberAndStatus(Member member, Betting.BettingStatus status);

    /**
     * 특정 사용자의 진행중인 배팅 존재 여부 확인
     */
    boolean existsByMemberAndStatus(Member member, Betting.BettingStatus status);
}

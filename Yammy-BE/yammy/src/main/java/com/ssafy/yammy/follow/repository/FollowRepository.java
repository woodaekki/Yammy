package com.ssafy.yammy.follow.repository;

import com.ssafy.yammy.follow.entity.Follow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    // 팔로우 관계 존재 확인
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    // 특정 팔로우 관계 찾기
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    // 팔로워 목록 (나를 팔로우한 사람들) - 페이징
    Page<Follow> findByFollowingId(Long followingId, Pageable pageable);

    // 팔로잉 목록 (내가 팔로우한 사람들) - 페이징
    Page<Follow> findByFollowerId(Long followerId, Pageable pageable);

    // 팔로워 수
    long countByFollowingId(Long followingId);

    // 팔로잉 수
    long countByFollowerId(Long followerId);

    // 언팔로우
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);

    // 배치 조회: 특정 사용자가 여러 사용자를 팔로우하고 있는지 확인
    @Query("SELECT f.followingId FROM Follow f WHERE f.followerId = :followerId AND f.followingId IN :followingIds")
    List<Long> findFollowingIdsByFollowerIdAndFollowingIds(@Param("followerId") Long followerId, @Param("followingIds") List<Long> followingIds);
}

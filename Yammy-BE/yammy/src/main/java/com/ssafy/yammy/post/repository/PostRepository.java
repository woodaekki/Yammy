package com.ssafy.yammy.post.repository;

import com.ssafy.yammy.post.entity.Post;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // 전체 피드 조회 (최신순, 커서 기반 페이징)
    @Query("SELECT p FROM Post p WHERE (:cursor IS NULL OR p.id < :cursor) ORDER BY p.id DESC")
    List<Post> findAllWithCursor(@Param("cursor") Long cursor, Pageable pageable);

    // 내 피드 조회 (나 + 팔로우한 사람들, 최신순, 커서 기반 페이징)
    @Query("SELECT p FROM Post p WHERE p.memberId IN :memberIds AND (:cursor IS NULL OR p.id < :cursor) ORDER BY p.id DESC")
    List<Post> findByMemberIdsWithCursor(@Param("memberIds") List<Long> memberIds, @Param("cursor") Long cursor, Pageable pageable);

    // 특정 사용자의 게시글 조회 (프로필 페이지용)
    @Query("SELECT p FROM Post p WHERE p.memberId = :memberId AND (:cursor IS NULL OR p.id < :cursor) ORDER BY p.id DESC")
    List<Post> findByMemberIdWithCursor(@Param("memberId") Long memberId, @Param("cursor") Long cursor, Pageable pageable);

    // 사용자별 게시글 수
    long countByMemberId(Long memberId);
}

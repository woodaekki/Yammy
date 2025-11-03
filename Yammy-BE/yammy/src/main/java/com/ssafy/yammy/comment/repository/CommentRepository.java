package com.ssafy.yammy.comment.repository;

import com.ssafy.yammy.comment.entity.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 특정 게시글의 댓글 조회 (최신순, 커서 기반 페이징)
    @Query("SELECT c FROM Comment c WHERE c.postId = :postId AND (:cursor IS NULL OR c.id < :cursor) ORDER BY c.id DESC")
    List<Comment> findByPostIdWithCursor(@Param("postId") Long postId, @Param("cursor") Long cursor, Pageable pageable);

    // 특정 게시글의 댓글 수
    long countByPostId(Long postId);

    // 게시글 삭제 시 댓글도 함께 삭제
    void deleteByPostId(Long postId);
}

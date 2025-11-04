package com.ssafy.yammy.comment.repository;

import com.ssafy.yammy.comment.entity.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {

    // 좋아요 존재 여부 확인
    boolean existsByCommentIdAndMemberId(Long commentId, Long memberId);

    // 좋아요 찾기
    Optional<CommentLike> findByCommentIdAndMemberId(Long commentId, Long memberId);

    // 좋아요 삭제
    void deleteByCommentIdAndMemberId(Long commentId, Long memberId);

    // 댓글의 좋아요 수
    long countByCommentId(Long commentId);

    // 여러 댓글에 대한 사용자의 좋아요 여부 확인 (배치 조회)
    @Query("SELECT cl.commentId FROM CommentLike cl WHERE cl.commentId IN :commentIds AND cl.memberId = :memberId")
    List<Long> findLikedCommentIdsByMemberIdAndCommentIds(@Param("commentIds") List<Long> commentIds, @Param("memberId") Long memberId);
}

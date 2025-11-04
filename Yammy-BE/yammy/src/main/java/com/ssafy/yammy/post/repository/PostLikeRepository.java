package com.ssafy.yammy.post.repository;

import com.ssafy.yammy.post.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    // 좋아요 존재 여부 확인
    boolean existsByPostIdAndMemberId(Long postId, Long memberId);

    // 좋아요 찾기
    Optional<PostLike> findByPostIdAndMemberId(Long postId, Long memberId);

    // 좋아요 삭제
    void deleteByPostIdAndMemberId(Long postId, Long memberId);

    // 게시글의 좋아요 수
    long countByPostId(Long postId);

    // 여러 게시글에 대한 사용자의 좋아요 여부 확인 (배치 조회)
    @Query("SELECT pl.postId FROM PostLike pl WHERE pl.postId IN :postIds AND pl.memberId = :memberId")
    List<Long> findLikedPostIdsByMemberIdAndPostIds(@Param("postIds") List<Long> postIds, @Param("memberId") Long memberId);
}

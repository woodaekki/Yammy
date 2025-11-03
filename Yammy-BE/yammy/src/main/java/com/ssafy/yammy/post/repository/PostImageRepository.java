package com.ssafy.yammy.post.repository;

import com.ssafy.yammy.post.entity.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostImageRepository extends JpaRepository<PostImage, Long> {

    // 특정 게시글의 이미지 목록 조회 (순서대로)
    List<PostImage> findByPostIdOrderByImageOrder(Long postId);

    // 게시글 ID 리스트에 해당하는 모든 이미지 조회
    List<PostImage> findByPostIdIn(List<Long> postIds);

    // 게시글 삭제 시 이미지도 함께 삭제
    void deleteByPostId(Long postId);
}

package com.ssafy.yammy.post.service;

import com.ssafy.yammy.post.entity.Post;
import com.ssafy.yammy.post.entity.PostLike;
import com.ssafy.yammy.post.repository.PostLikeRepository;
import com.ssafy.yammy.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;

    // 좋아요 토글 (좋아요 <-> 좋아요 취소)
    @Transactional
    public boolean toggleLike(Long postId, Long memberId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        boolean isLiked = postLikeRepository.existsByPostIdAndMemberId(postId, memberId);

        if (isLiked) {
            // 좋아요 취소
            postLikeRepository.deleteByPostIdAndMemberId(postId, memberId);
            post.decrementLikeCount();
            postRepository.save(post);
            return false;
        } else {
            // 좋아요
            PostLike postLike = PostLike.builder()
                    .postId(postId)
                    .memberId(memberId)
                    .build();
            postLikeRepository.save(postLike);
            post.incrementLikeCount();
            postRepository.save(post);
            return true;
        }
    }

    // 좋아요 여부 확인
    @Transactional(readOnly = true)
    public boolean isLiked(Long postId, Long memberId) {
        return postLikeRepository.existsByPostIdAndMemberId(postId, memberId);
    }
}

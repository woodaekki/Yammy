package com.ssafy.yammy.comment.service;

import com.ssafy.yammy.comment.entity.Comment;
import com.ssafy.yammy.comment.entity.CommentLike;
import com.ssafy.yammy.comment.repository.CommentLikeRepository;
import com.ssafy.yammy.comment.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentLikeService {

    private final CommentLikeRepository commentLikeRepository;
    private final CommentRepository commentRepository;

    // 댓글 좋아요 토글
    @Transactional
    public boolean toggleLike(Long commentId, Long memberId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));

        boolean isLiked = commentLikeRepository.existsByCommentIdAndMemberId(commentId, memberId);

        if (isLiked) {
            // 좋아요 취소
            commentLikeRepository.deleteByCommentIdAndMemberId(commentId, memberId);
            comment.decrementLikeCount();
            commentRepository.save(comment);
            return false;
        } else {
            // 좋아요
            CommentLike commentLike = CommentLike.builder()
                    .commentId(commentId)
                    .memberId(memberId)
                    .build();
            commentLikeRepository.save(commentLike);
            comment.incrementLikeCount();
            commentRepository.save(comment);
            return true;
        }
    }

    // 좋아요 여부 확인
    @Transactional(readOnly = true)
    public boolean isLiked(Long commentId, Long memberId) {
        return commentLikeRepository.existsByCommentIdAndMemberId(commentId, memberId);
    }

    // 좋아요 수 조회
    @Transactional(readOnly = true)
    public long getLikeCount(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));
        return comment.getLikeCount();
    }
}

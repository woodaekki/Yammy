package com.ssafy.yammy.comment.controller;

import com.ssafy.yammy.comment.dto.CommentListResponse;
import com.ssafy.yammy.comment.dto.CommentRequest;
import com.ssafy.yammy.comment.dto.CommentResponse;
import com.ssafy.yammy.comment.service.CommentLikeService;
import com.ssafy.yammy.comment.service.CommentService;
import com.ssafy.yammy.config.CustomUserDetails;
import com.ssafy.yammy.post.dto.LikeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Tag(name = "Comment", description = "댓글 API")
public class CommentController {

    private final CommentService commentService;
    private final CommentLikeService commentLikeService;

    /**
     * 댓글 작성
     */
    @PostMapping("/post/{postId}")
    @Operation(summary = "댓글 작성", description = "게시글에 새 댓글을 작성합니다.")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CommentRequest request) {

        Long memberId = userDetails.getMemberId();
        log.info("[CommentController] POST /api/comments/post/{} - memberId: {}", postId, memberId);

        CommentResponse response = commentService.createComment(postId, memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 댓글 조회
     */
    @GetMapping("/post/{postId}")
    @Operation(summary = "댓글 조회", description = "게시글의 댓글 목록을 조회합니다. (커서 기반 페이징)")
    public ResponseEntity<CommentListResponse> getComments(
            @PathVariable Long postId,
            @RequestParam(required = false) Long cursor,
            @AuthenticationPrincipal(errorOnInvalidType = false) CustomUserDetails userDetails) {

        Long memberId = userDetails != null ? userDetails.getMemberId() : null;
        log.info("[CommentController] GET /api/comments/post/{} - cursor: {}, memberId: {}", postId, cursor, memberId);

        CommentListResponse response = commentService.getComments(postId, cursor, memberId);
        return ResponseEntity.ok(response);
    }

    /**
     * 댓글 수정
     */
    @PatchMapping("/{commentId}")
    @Operation(summary = "댓글 수정", description = "댓글을 수정합니다.")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody CommentRequest request) {

        Long memberId = userDetails.getMemberId();
        log.info("[CommentController] PATCH /api/comments/{} - memberId: {}", commentId, memberId);

        CommentResponse response = commentService.updateComment(commentId, memberId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 댓글 삭제
     */
    @DeleteMapping("/{commentId}")
    @Operation(summary = "댓글 삭제", description = "댓글을 삭제합니다.")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long memberId = userDetails.getMemberId();
        log.info("[CommentController] DELETE /api/comments/{} - memberId: {}", commentId, memberId);

        commentService.deleteComment(commentId, memberId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 댓글 좋아요 토글
     */
    @PostMapping("/{commentId}/like")
    @Operation(summary = "댓글 좋아요 토글", description = "댓글에 좋아요를 누르거나 취소합니다.")
    public ResponseEntity<LikeResponse> toggleLike(
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long memberId = userDetails.getMemberId();
        log.info("[CommentController] POST /api/comments/{}/like - memberId: {}", commentId, memberId);

        boolean isLiked = commentLikeService.toggleLike(commentId, memberId);
        long likeCount = commentLikeService.getLikeCount(commentId);

        LikeResponse response = LikeResponse.builder()
                .isLiked(isLiked)
                .likeCount((int) likeCount)
                .build();

        return ResponseEntity.ok(response);
    }
}

package com.ssafy.yammy.post.controller;

import com.ssafy.yammy.config.CustomUserDetails;
import com.ssafy.yammy.payment.dto.PhotoUploadResponse;
import com.ssafy.yammy.payment.service.PhotoService;
import com.ssafy.yammy.post.dto.*;
import com.ssafy.yammy.post.service.PostLikeService;
import com.ssafy.yammy.post.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Post", description = "게시글 API")
public class PostController {

    private final PostService postService;
    private final PostLikeService postLikeService;
    private final PhotoService photoService;

    /**
     * S3 Presigned URL 발급 (게시글 이미지 업로드용)
     */
    @PostMapping("/presignedUrls")
    @Operation(summary = "게시글 이미지 업로드용 Presigned URL 발급", description = "1~3개의 이미지를 업로드하기 위한 Presigned URL을 발급합니다.")
    public ResponseEntity<List<PhotoUploadResponse>> getPresignedUrls(
            @RequestParam int count,
            @RequestParam(defaultValue = "image/jpeg") String contentType) {

        if (count < 1 || count > 3) {
            throw new IllegalArgumentException("게시글에는 1~3개의 이미지만 업로드할 수 있습니다.");
        }

        List<PhotoUploadResponse> responses = photoService.generatePresignedUrls(count, contentType);
        return ResponseEntity.ok(responses);
    }

    /**
     * 게시글 작성
     */
    @PostMapping
    @Operation(summary = "게시글 작성", description = "새 게시글을 작성합니다. 이미지는 사전에 S3에 업로드되어야 합니다.")
    public ResponseEntity<PostResponse> createPost(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PostCreateRequest request) {

        Long memberId = userDetails.getMemberId();
        log.info("[PostController] POST /api/posts - memberId: {}, imageCount: {}", memberId, request.getImageUrls().size());

        PostResponse response = postService.createPost(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 게시글 상세 조회
     */
    @GetMapping("/{postId}")
    @Operation(summary = "게시글 상세 조회", description = "특정 게시글의 상세 정보를 조회합니다.")
    public ResponseEntity<PostResponse> getPost(
            @PathVariable Long postId,
            @AuthenticationPrincipal(errorOnInvalidType = false) CustomUserDetails userDetails) {

        Long memberId = userDetails != null ? userDetails.getMemberId() : null;
        log.info("[PostController] GET /api/posts/{} - memberId: {}", postId, memberId);

        PostResponse response = postService.getPost(postId, memberId);
        return ResponseEntity.ok(response);
    }

    /**
     * 전체 피드 조회
     */
    @GetMapping("/all")
    @Operation(summary = "전체 피드 조회", description = "모든 사용자의 게시글을 최신순으로 조회합니다. (커서 기반 페이징)")
    public ResponseEntity<PostListResponse> getAllPosts(
            @RequestParam(required = false) Long cursor,
            @AuthenticationPrincipal(errorOnInvalidType = false) CustomUserDetails userDetails) {

        Long memberId = userDetails != null ? userDetails.getMemberId() : null;
        log.info("[PostController] GET /api/posts/all - cursor: {}, memberId: {}", cursor, memberId);

        PostListResponse response = postService.getAllPosts(cursor, memberId);
        return ResponseEntity.ok(response);
    }

    /**
     * 내 피드 조회 (나 + 팔로우한 사람들)
     */
    @GetMapping("/feed")
    @Operation(summary = "내 피드 조회", description = "나와 내가 팔로우한 사람들의 게시글을 최신순으로 조회합니다. (커서 기반 페이징)")
    public ResponseEntity<PostListResponse> getMyFeed(
            @RequestParam(required = false) Long cursor,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long memberId = userDetails.getMemberId();
        log.info("[PostController] GET /api/posts/feed - cursor: {}, memberId: {}", cursor, memberId);

        PostListResponse response = postService.getMyFeed(cursor, memberId);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 사용자의 게시글 조회 (프로필 페이지용)
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "특정 사용자의 게시글 조회", description = "특정 사용자의 게시글을 최신순으로 조회합니다. (커서 기반 페이징)")
    public ResponseEntity<PostListResponse> getUserPosts(
            @PathVariable Long userId,
            @RequestParam(required = false) Long cursor,
            @AuthenticationPrincipal(errorOnInvalidType = false) CustomUserDetails userDetails) {

        Long memberId = userDetails != null ? userDetails.getMemberId() : null;
        log.info("[PostController] GET /api/posts/user/{} - cursor: {}, memberId: {}", userId, cursor, memberId);

        PostListResponse response = postService.getUserPosts(userId, cursor, memberId);
        return ResponseEntity.ok(response);
    }

    /**
     * 게시글 수정 (캡션만)
     */
    @PatchMapping("/{postId}")
    @Operation(summary = "게시글 수정", description = "게시글의 캡션을 수정합니다. (이미지는 수정 불가)")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody PostUpdateRequest request) {

        Long memberId = userDetails.getMemberId();
        log.info("[PostController] PATCH /api/posts/{} - memberId: {}", postId, memberId);

        PostResponse response = postService.updatePost(postId, memberId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 게시글 삭제
     */
    @DeleteMapping("/{postId}")
    @Operation(summary = "게시글 삭제", description = "게시글을 삭제합니다.")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long memberId = userDetails.getMemberId();
        log.info("[PostController] DELETE /api/posts/{} - memberId: {}", postId, memberId);

        postService.deletePost(postId, memberId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 게시글 좋아요 토글
     */
    @PostMapping("/{postId}/like")
    @Operation(summary = "게시글 좋아요 토글", description = "게시글에 좋아요를 누르거나 취소합니다.")
    public ResponseEntity<LikeResponse> toggleLike(
            @PathVariable Long postId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long memberId = userDetails.getMemberId();
        log.info("[PostController] POST /api/posts/{}/like - memberId: {}", postId, memberId);

        boolean isLiked = postLikeService.toggleLike(postId, memberId);

        // 좋아요 수 다시 조회
        PostResponse post = postService.getPost(postId, memberId);

        LikeResponse response = LikeResponse.builder()
                .isLiked(isLiked)
                .likeCount(post.getLikeCount())
                .build();

        return ResponseEntity.ok(response);
    }
}

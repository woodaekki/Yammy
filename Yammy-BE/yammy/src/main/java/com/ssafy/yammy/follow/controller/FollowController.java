package com.ssafy.yammy.follow.controller;

import com.ssafy.yammy.config.CustomUserDetails;
import com.ssafy.yammy.follow.dto.FollowListResponse;
import com.ssafy.yammy.follow.dto.FollowResponse;
import com.ssafy.yammy.follow.dto.FollowStatusResponse;
import com.ssafy.yammy.follow.service.FollowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
@Tag(name = "Follow", description = "팔로우 API")
public class FollowController {

    private final FollowService followService;

    /**
     * 팔로우
     */
    @PostMapping("/{followingId}")
    @Operation(summary = "팔로우", description = "특정 회원을 팔로우합니다.")
    public ResponseEntity<FollowResponse> follow(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long followingId) {

        Long followerId = userDetails.getMemberId();
        log.info("[FollowController] POST /api/follows/{} - followerId: {}", followingId, followerId);

        FollowResponse response = followService.follow(followerId, followingId);
        return ResponseEntity.ok(response);
    }

    /**
     * 언팔로우
     */
    @DeleteMapping("/{followingId}")
    @Operation(summary = "언팔로우", description = "특정 회원을 언팔로우합니다.")
    public ResponseEntity<FollowResponse> unfollow(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long followingId) {

        Long followerId = userDetails.getMemberId();
        log.info("[FollowController] DELETE /api/follows/{} - followerId: {}", followingId, followerId);

        FollowResponse response = followService.unfollow(followerId, followingId);
        return ResponseEntity.ok(response);
    }

    /**
     * 팔로워 목록 (나를 팔로우한 사람들)
     */
    @GetMapping("/followers/{memberId}")
    @Operation(summary = "팔로워 목록", description = "특정 회원의 팔로워 목록을 조회합니다. (무한 스크롤)")
    public ResponseEntity<Page<FollowListResponse>> getFollowers(
            @PathVariable Long memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("[FollowController] GET /api/follows/followers/{} - page: {}, size: {}", memberId, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FollowListResponse> followers = followService.getFollowers(memberId, pageable);

        return ResponseEntity.ok(followers);
    }

    /**
     * 팔로잉 목록 (내가 팔로우한 사람들)
     */
    @GetMapping("/following/{memberId}")
    @Operation(summary = "팔로잉 목록", description = "특정 회원의 팔로잉 목록을 조회합니다. (무한 스크롤)")
    public ResponseEntity<Page<FollowListResponse>> getFollowing(
            @PathVariable Long memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("[FollowController] GET /api/follows/following/{} - page: {}, size: {}", memberId, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FollowListResponse> following = followService.getFollowing(memberId, pageable);

        return ResponseEntity.ok(following);
    }

    /**
     * 팔로우 상태 확인
     */
    @GetMapping("/status/{memberId}")
    @Operation(summary = "팔로우 상태", description = "특정 회원과의 팔로우 상태를 확인합니다.")
    public ResponseEntity<FollowStatusResponse> getFollowStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long memberId) {

        Long followerId = userDetails.getMemberId();
        log.info("[FollowController] GET /api/follows/status/{} - followerId: {}", memberId, followerId);

        FollowStatusResponse status = followService.getFollowStatus(followerId, memberId);
        return ResponseEntity.ok(status);
    }
}

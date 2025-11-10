package com.ssafy.yammy.follow.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.follow.dto.FollowListResponse;
import com.ssafy.yammy.follow.dto.FollowResponse;
import com.ssafy.yammy.follow.dto.FollowStatusResponse;
import com.ssafy.yammy.follow.entity.Follow;
import com.ssafy.yammy.follow.repository.FollowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FollowService {

    private final FollowRepository followRepository;
    private final MemberRepository memberRepository;

    /**
     * 팔로우 하기 (Idempotent - 여러 번 호출해도 같은 결과)
     */
    @Transactional
    public FollowResponse follow(Long followerId, Long followingId) {
        log.info("[FollowService] 팔로우 요청: followerId={}, followingId={}", followerId, followingId);

        // 자기 자신 팔로우 방지
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("자기 자신을 팔로우할 수 없습니다.");
        }

        // 이미 팔로우 중인지 확인
        boolean alreadyFollowing = followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
        if (alreadyFollowing) {
            log.info("[FollowService] 이미 팔로우 중입니다 (Idempotent): followerId={}, followingId={}", followerId, followingId);
            // 에러 대신 성공 응답 반환 (Idempotent)
            return new FollowResponse(true, "팔로우 성공");
        }

        // 팔로우 대상 회원 존재 확인
        if (!memberRepository.existsById(followingId)) {
            throw new IllegalArgumentException("존재하지 않는 회원입니다.");
        }

        Follow follow = Follow.builder()
                .followerId(followerId)
                .followingId(followingId)
                .build();

        followRepository.save(follow);
        log.info("[FollowService] 팔로우 성공");

        return new FollowResponse(true, "팔로우 성공");
    }

    /**
     * 언팔로우 하기 (Idempotent - 여러 번 호출해도 같은 결과)
     */
    @Transactional
    public FollowResponse unfollow(Long followerId, Long followingId) {
        log.info("[FollowService] 언팔로우 요청: followerId={}, followingId={}", followerId, followingId);

        boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
        if (!isFollowing) {
            log.info("[FollowService] 이미 언팔로우 상태입니다 (Idempotent): followerId={}, followingId={}", followerId, followingId);
            // 에러 대신 성공 응답 반환 (Idempotent)
            return new FollowResponse(false, "언팔로우 성공");
        }

        followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
        log.info("[FollowService] 언팔로우 성공");

        return new FollowResponse(false, "언팔로우 성공");
    }

    /**
     * 팔로워 목록 (나를 팔로우한 사람들) - 페이징
     */
    public Page<FollowListResponse> getFollowers(Long memberId, Pageable pageable) {
        log.info("[FollowService] 팔로워 목록 조회: memberId={}", memberId);

        Page<Follow> follows = followRepository.findByFollowingId(memberId, pageable);

        return follows.map(follow -> {
            Member member = memberRepository.findById(follow.getFollowerId())
                    .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
            return new FollowListResponse(
                    member.getMemberId(),
                    member.getNickname(),
                    member.getProfileImage()
            );
        });
    }

    /**
     * 팔로잉 목록 (내가 팔로우한 사람들) - 페이징
     */
    public Page<FollowListResponse> getFollowing(Long memberId, Pageable pageable) {
        log.info("[FollowService] 팔로잉 목록 조회: memberId={}", memberId);

        Page<Follow> follows = followRepository.findByFollowerId(memberId, pageable);

        return follows.map(follow -> {
            Member member = memberRepository.findById(follow.getFollowingId())
                    .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
            return new FollowListResponse(
                    member.getMemberId(),
                    member.getNickname(),
                    member.getProfileImage()
            );
        });
    }

    /**
     * 팔로우 상태 확인
     */
    public FollowStatusResponse getFollowStatus(Long followerId, Long followingId) {
        log.info("[FollowService] 팔로우 상태 확인: followerId={}, followingId={}", followerId, followingId);

        boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
        long followerCount = followRepository.countByFollowingId(followingId);
        long followingCount = followRepository.countByFollowerId(followingId);

        return new FollowStatusResponse(isFollowing, followerCount, followingCount);
    }
}
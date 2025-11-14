package com.ssafy.yammy.auth.service;

import com.ssafy.yammy.auth.dto.MemberSearchResponse;
import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.follow.repository.FollowRepository;
import com.ssafy.yammy.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final FollowRepository followRepository;
    private final PostRepository postRepository;

    /**
     * 닉네임으로 회원 검색
     */
    public List<MemberSearchResponse> searchMembers(String query, Long currentMemberId) {
        log.info("회원 검색: query={}, currentMemberId={}", query, currentMemberId);

        // 탈퇴하지 않은 회원 중에서 닉네임으로 검색
        List<Member> members = memberRepository.findByNicknameContainingAndDeletedAtIsNull(query);

        return members.stream()
                .map(member -> {
                    Long followerCount = followRepository.countByFollowingId(member.getMemberId());
                    Long postCount = postRepository.countByMemberId(member.getMemberId());
                    Boolean isFollowing = currentMemberId != null &&
                            followRepository.existsByFollowerIdAndFollowingId(currentMemberId, member.getMemberId());

                    return MemberSearchResponse.from(member, followerCount, postCount, isFollowing);
                })
                .collect(Collectors.toList());
    }

    /**
     * 전체 회원 목록 조회 (가입순)
     */
    public List<MemberSearchResponse> getAllMembers(Long currentMemberId, Pageable pageable) {
        log.info("전체 회원 목록 조회: currentMemberId={}, page={}", currentMemberId, pageable.getPageNumber());

        // 탈퇴하지 않은 회원만 조회
        Page<Member> membersPage = memberRepository.findAllByDeletedAtIsNull(pageable);

        return membersPage.getContent().stream()
                .map(member -> {
                    Long followerCount = followRepository.countByFollowingId(member.getMemberId());
                    Long postCount = postRepository.countByMemberId(member.getMemberId());
                    Boolean isFollowing = currentMemberId != null &&
                            followRepository.existsByFollowerIdAndFollowingId(currentMemberId, member.getMemberId());

                    return MemberSearchResponse.from(member, followerCount, postCount, isFollowing);
                })
                .collect(Collectors.toList());
    }
}

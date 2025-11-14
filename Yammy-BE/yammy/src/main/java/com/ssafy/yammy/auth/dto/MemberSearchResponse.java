package com.ssafy.yammy.auth.dto;

import com.ssafy.yammy.auth.entity.Member;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberSearchResponse {
    private Long memberId;
    private String nickname;
    private String profileImage;
    private String team;
    private Long followerCount;
    private Long postCount;
    private Boolean isFollowing;

    public static MemberSearchResponse from(Member member, Long followerCount, Long postCount, Boolean isFollowing) {
        return MemberSearchResponse.builder()
                .memberId(member.getMemberId())
                .nickname(member.getNickname())
                .profileImage(member.getProfileImage())
                .team(member.getTeam())
                .followerCount(followerCount)
                .postCount(postCount)
                .isFollowing(isFollowing)
                .build();
    }
}

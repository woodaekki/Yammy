package com.ssafy.yammy.auth.dto;

import com.ssafy.yammy.auth.entity.Member;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MemberInfoResponse {
    private Long memberId;
    private String name;
    private String nickname;
    private String id;
    private String email;
    private Long exp; // 팬심(경험치)
    private String team;
    private Long gameTag;
    private String bio;
    private String profileImage;

    public static MemberInfoResponse from(Member member) {
        return new MemberInfoResponse(
            member.getMemberId(),
            member.getName(),
            member.getNickname(),
            member.getId(),
            member.getEmail(),
            member.getExp(),
            member.getTeam(),
            member.getGameTag(),
            member.getBio(),
            member.getProfileImage()
        );
    }
}

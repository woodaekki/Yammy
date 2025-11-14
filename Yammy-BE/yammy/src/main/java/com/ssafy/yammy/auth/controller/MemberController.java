package com.ssafy.yammy.auth.controller;

import com.ssafy.yammy.auth.dto.MemberSearchResponse;
import com.ssafy.yammy.auth.service.MemberService;
import com.ssafy.yammy.config.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(name = "Member API", description = "회원 관련 API")
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /**
     * 회원 검색 (닉네임)
     */
    @GetMapping("/search")
    @Operation(summary = "회원 검색", description = "닉네임으로 회원을 검색합니다.")
    public ResponseEntity<List<MemberSearchResponse>> searchMembers(
            @RequestParam String query,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long currentMemberId = userDetails != null ? userDetails.getMemberId() : null;
        log.info("[MemberController] GET /api/members/search - query: {}, currentMemberId: {}", query, currentMemberId);

        List<MemberSearchResponse> members = memberService.searchMembers(query, currentMemberId);
        return ResponseEntity.ok(members);
    }

    /**
     * 전체 회원 목록 조회 (가입순)
     */
    @GetMapping("/all")
    @Operation(summary = "전체 회원 목록", description = "전체 회원 목록을 가입순으로 조회합니다.")
    public ResponseEntity<List<MemberSearchResponse>> getAllMembers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long currentMemberId = userDetails != null ? userDetails.getMemberId() : null;
        log.info("[MemberController] GET /api/members/all - page: {}, size: {}, currentMemberId: {}",
                page, size, currentMemberId);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").ascending());
        List<MemberSearchResponse> members = memberService.getAllMembers(currentMemberId, pageable);

        return ResponseEntity.ok(members);
    }
}

package com.ssafy.yammy.predict.controller;

import com.ssafy.yammy.predict.dto.MatchScheduleResponse;
import com.ssafy.yammy.predict.dto.*;
import com.ssafy.yammy.predict.entity.PredictMatchSchedule;
import com.ssafy.yammy.predict.service.PredictService;
import com.ssafy.yammy.predict.service.BettingService;
import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.config.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/predict")
@RequiredArgsConstructor
@Tag(name = "Predict", description = "승부예측 API")
public class PredictController {

    private final PredictService predictService;
    private final BettingService bettingService;

    /**
     * 특정 날짜의 경기 목록 조회
     */
    @GetMapping("/matches")
    @Operation(summary = "날짜별 경기 조회", description = "특정 날짜의 예정된 경기 목록을 조회합니다.")
    public ResponseEntity<List<MatchScheduleResponse>> getMatchesByDate(
            @RequestParam 
            @Parameter(description = "경기 날짜 (YYYYMMDD 형식)", example = "20251110") 
            String date) {
        
        log.info("날짜별 경기 조회 요청 - date: {}", date);
        
        // 1. 기본 경기 데이터 조회
        List<MatchScheduleResponse> matches = predictService.getMatchesByDate(date);
        
        // 2. 각 경기에 대한 배당률 계산 및 추가
        List<MatchScheduleResponse> matchesWithOdds = matches.stream()
                .map(match -> {
                    try {
                        // 경기에 대한 Entity 재생성 (배당률 계산을 위해)
                        PredictMatchSchedule matchEntity = PredictMatchSchedule.builder()
                                .id(match.getId())
                                .matchDate(match.getMatchDate())
                                .home(convertTeamCodeFromName(match.getHome()))
                                .away(convertTeamCodeFromName(match.getAway()))
                                .build();
                        
                        // 배당률 계산
                        Double homeOdds = bettingService.calculateOddsForTeam(matchEntity, 0);
                        Double awayOdds = bettingService.calculateOddsForTeam(matchEntity, 1);
                        
                        // 배당률이 포함된 새로운 Response 생성
                        return MatchScheduleResponse.builder()
                                .id(match.getId())
                                .matchStatus(match.getMatchStatus())
                                .matchDate(match.getMatchDate())
                                .home(match.getHome())
                                .away(match.getAway())
                                .gameid(match.getGameid())
                                .year(match.getYear())
                                .homeOdds(homeOdds)
                                .awayOdds(awayOdds)
                                .build();
                    } catch (Exception e) {
                        log.warn("배당률 계산 실패 - 경기 ID: {}, 오류: {}", match.getId(), e.getMessage());
                        // 배당률 계산 실패 시 기본값 사용
                        return MatchScheduleResponse.builder()
                                .id(match.getId())
                                .matchStatus(match.getMatchStatus())
                                .matchDate(match.getMatchDate())
                                .home(match.getHome())
                                .away(match.getAway())
                                .gameid(match.getGameid())
                                .year(match.getYear())
                                .homeOdds(2.0) // 기본 배당률
                                .awayOdds(2.0) // 기본 배당률
                                .build();
                    }
                })
                .collect(Collectors.toList());
        
        log.info("조회된 경기 수: {}", matchesWithOdds.size());
        
        return ResponseEntity.ok(matchesWithOdds);
    }
    
    /**
     * 팀 이름을 팀 코드로 역변환 (배당률 계산용)
     */
    private String convertTeamCodeFromName(String teamName) {
        switch (teamName) {
            case "KIA": return "HT";
            case "삼성": return "SS";
            case "LG": return "LG";
            case "두산": return "OB";
            case "KT": return "KT";
            case "SSG": return "SK";
            case "롯데": return "LT";
            case "한화": return "HH";
            case "NC": return "NC";
            case "키움": return "WO";
            default: return teamName;
        }
    }

    /**
     * 배팅 생성
     */
    @PostMapping("/betting")
    @Operation(summary = "배팅 생성", description = "새로운 배팅을 생성합니다.")
    public ResponseEntity<BettingResponse> createBetting(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BettingCreateRequest request) {
        
        log.info("배팅 생성 요청 - 사용자: {}, 요청: {}", 
                userDetails != null ? userDetails.getUsername() : "null", request);
        
        // 🔥 인증 정보 확인 디버깅
        if (userDetails == null) {
            log.error("인증 정보가 null입니다!");
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        
        Member member = userDetails.getMember();
        if (member == null) {
            log.error("멤버 정보가 null입니다!");
            throw new IllegalStateException("사용자 정보가 없습니다.");
        }
        
        log.info("인증된 멤버: ID={}, 로그인ID={}", member.getMemberId(), member.getId());
        
        BettingResponse response = bettingService.createBetting(member, request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자의 배팅 내역 조회
     */
    @GetMapping("/betting/my")
    @Operation(summary = "내 배팅 내역 조회", description = "로그인한 사용자의 배팅 내역을 조회합니다.")
    public ResponseEntity<Page<BettingResponse>> getUserBettings(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) 
            @Parameter(description = "배팅 상태 (PENDING, WIN, LOSE, CANCELLED)", example = "PENDING")
            String status,
            @PageableDefault(size = 10) Pageable pageable) {
        
        log.info("내 배팅 내역 조회 요청 - 사용자: {}, 상태: {}", userDetails.getUsername(), status);
        
        Member member = userDetails.getMember();
        Page<BettingResponse> bettings = bettingService.getUserBettings(member, status, pageable);
        
        return ResponseEntity.ok(bettings);
    }

    /**
     * 배팅 취소
     */
    @DeleteMapping("/betting/{bettingId}")
    @Operation(summary = "배팅 취소", description = "진행중인 배팅을 취소합니다.")
    public ResponseEntity<Void> cancelBetting(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable 
            @Parameter(description = "배팅 ID", example = "1")
            Long bettingId) {
        
        log.info("배팅 취소 요청 - 사용자: {}, 배팅 ID: {}", userDetails.getUsername(), bettingId);
        
        Member member = userDetails.getMember();
        bettingService.cancelBetting(member, bettingId);
        
        return ResponseEntity.ok().build();
    }
}

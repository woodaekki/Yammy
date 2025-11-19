package com.ssafy.yammy.match.controller;

import com.ssafy.yammy.match.dto.MatchResponse;
import com.ssafy.yammy.match.service.MatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
@Tag(name = "Match", description = "KBO 경기 데이터 API")
public class MatchController {

    private final MatchService matchService;

    /**
     * 최근 경기 목록 조회
     */
    @GetMapping
    @Operation(summary = "최근 경기 목록 조회", description = "최근 KBO 경기 목록을 페이징하여 조회합니다.")
    public ResponseEntity<Page<MatchResponse>> getRecentMatches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<MatchResponse> matches = matchService.getRecentMatches(page, size);
        return ResponseEntity.ok(matches);
    }

    /**
     * 특정 경기 상세 조회
     */
    @GetMapping("/{matchcode}")
    @Operation(summary = "경기 상세 조회", description = "matchcode로 특정 경기의 상세 정보를 조회합니다.")
    public ResponseEntity<MatchResponse> getMatchDetail(@PathVariable String matchcode) {
        MatchResponse match = matchService.getMatchDetail(matchcode);
        return ResponseEntity.ok(match);
    }

    /**
     * 특정 날짜의 경기 목록 조회
     */
    @GetMapping("/date/{date}")
    @Operation(summary = "날짜별 경기 조회", description = "특정 날짜의 모든 경기를 조회합니다.")
    public ResponseEntity<List<MatchResponse>> getMatchesByDate(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {

        List<MatchResponse> matches = matchService.getMatchesByDate(date);
        return ResponseEntity.ok(matches);
    }

    /**
     * 특정 팀의 최근 경기 조회
     */
    @GetMapping("/team/{team}")
    @Operation(summary = "팀별 경기 조회", description = "특정 팀의 최근 경기를 조회합니다.")
    public ResponseEntity<Page<MatchResponse>> getMatchesByTeam(
            @PathVariable String team,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<MatchResponse> matches = matchService.getMatchesByTeam(team, page, size);
        return ResponseEntity.ok(matches);
    }

    /**
     * 날짜 범위로 경기 조회
     */
    @GetMapping("/range")
    @Operation(summary = "기간별 경기 조회", description = "시작일과 종료일 사이의 경기를 조회합니다.")
    public ResponseEntity<Page<MatchResponse>> getMatchesByDateRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<MatchResponse> matches = matchService.getMatchesByDateRange(startDate, endDate, page, size);
        return ResponseEntity.ok(matches);
    }
}

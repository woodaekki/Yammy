package com.ssafy.yammy.payment.controller;

import com.ssafy.yammy.payment.dto.UsedItemRequestDto;
import com.ssafy.yammy.payment.dto.UsedItemResponseDto;
import com.ssafy.yammy.payment.entity.Team;
import com.ssafy.yammy.payment.service.UsedItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
@Tag(name = "UsedItem API", description = "중고거래 게시글 관련 API")
@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
public class UsedItemController {

    private final UsedItemService usedItemService;

    // 전체 조회
    @Operation(summary = "중고 거래 목록 전체 조회")
    @GetMapping
    // pageable은 기본 10장씩 지원함
    public ResponseEntity<Page<UsedItemResponseDto>> getAllTrades(Pageable pageable) {
        return ResponseEntity.ok(usedItemService.getAllTrades(pageable));
    }

    // 단건 조회
    @Operation(summary = "중고 거래 게시글 단건 조회")
    @GetMapping("/{id}")
    public ResponseEntity<UsedItemResponseDto> getTrade(@PathVariable Long id) {
        return ResponseEntity.ok(usedItemService.getTrade(id));
    }

    // 게시물 작성
    @Operation(summary = "중고 거래 게시물 작성")
    @PostMapping
    public ResponseEntity<UsedItemResponseDto> createTrade(
            HttpServletRequest request,
            @Valid @RequestBody UsedItemRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(usedItemService.createTrade(request, dto));
    }


    // 게시물 수정
    @Operation(summary = "중고 거래 게시물 수정")
    @PutMapping("/{id}")
    public ResponseEntity<UsedItemResponseDto> updateTrade(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody UsedItemRequestDto dto) {
        return ResponseEntity.ok(usedItemService.updateTrade(request, id, dto));
    }

    // 게시물 삭제
    @Operation(summary = "중고 거래 게시물 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrade(
            HttpServletRequest request,
            @PathVariable Long id) {
        usedItemService.deleteTrade(request, id);
        return ResponseEntity.noContent().build();
    }

    // 검색 (팀 + 키워드)
    @Operation(summary = "팀/키워드 기반 중고 거래 게시글 검색")
    @GetMapping("/search")
    public ResponseEntity<List<UsedItemResponseDto>> searchUsedItems(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Team team
    ) {
        return ResponseEntity.ok(usedItemService.searchUsedItems(keyword, team));
    }
}

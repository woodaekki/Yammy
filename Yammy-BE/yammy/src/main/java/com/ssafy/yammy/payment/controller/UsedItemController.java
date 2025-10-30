package com.ssafy.yammy.payment.controller;

import com.ssafy.yammy.payment.dto.UsedItemRequestDto;
import com.ssafy.yammy.payment.dto.UsedItemResponseDto;
import com.ssafy.yammy.payment.entity.Photo;
import com.ssafy.yammy.payment.entity.UsedItem;
import com.ssafy.yammy.payment.repository.PhotoRepository;
import com.ssafy.yammy.payment.repository.UsedItemRepository;
import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.config.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
@Tag(name = "UsedItem API", description = "중고거래 게시글 관련 API")
@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
public class UsedItemController {

    private final UsedItemRepository usedItemRepository;
    private final PhotoRepository photoRepository;
    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;

    // 중고 거래 전체 조회
    @Operation(summary = "중고 거래 목록 전체 조회")
    @GetMapping
    public ResponseEntity<List<UsedItemResponseDto>> getAllTrades() {
        List<UsedItem> items = usedItemRepository.findAll();

        List<UsedItemResponseDto> response = items.stream()
                .map(item -> UsedItemResponseDto.builder()
                        .id(item.getId())
                        .memberId(item.getMember() != null ? item.getMember().getMemberId() : null)
                        .nickname(item.getNickname())
                        .title(item.getTitle())
                        .description(item.getDescription())
                        .price(item.getPrice())
                        .status(item.getStatus())
                        .createdAt(item.getCreatedAt())
                        .updatedAt(item.getUpdatedAt())
                        .imageUrls(item.getPhotos().stream().map(Photo::getFileUrl).toList())
                        .build()
                ).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 중고 거래 단건 조회
    @Operation(summary = "중고 거래 게시글 단건 조회")
    @GetMapping("/{id}")
    public ResponseEntity<UsedItemResponseDto> getTrade(@PathVariable Long id) {
        UsedItem item = usedItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        UsedItemResponseDto response = UsedItemResponseDto.builder()
                .id(item.getId())
                .memberId(item.getMember() != null ? item.getMember().getMemberId() : null)
                .nickname(item.getNickname())
                .title(item.getTitle())
                .description(item.getDescription())
                .price(item.getPrice())
                .status(item.getStatus())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .imageUrls(item.getPhotos().stream().map(Photo::getFileUrl).toList())
                .build();

        return ResponseEntity.ok(response);
    }

    // 게시물 작성
    @Operation(summary = "중고 거래 게시물 작성 ")
    @PostMapping
    public ResponseEntity<UsedItemResponseDto> createTrade(
            HttpServletRequest request,
            @Valid @RequestBody UsedItemRequestDto dto) {

        String token = extractToken(request);
        Long memberId = jwtTokenProvider.getMemberId(token);

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 회원입니다."));

        UsedItem usedItem = new UsedItem();
        usedItem.setMember(member);
        usedItem.setNickname(member.getNickname());
        usedItem.setTitle(dto.getTitle());
        usedItem.setDescription(dto.getDescription());
        usedItem.setPrice(dto.getPrice());

        // 사진 연결
        if (dto.getPhotoIds() != null && !dto.getPhotoIds().isEmpty()) {
            List<Photo> photos = photoRepository.findAllById(dto.getPhotoIds());
            photos.forEach(usedItem::addPhoto);
        }

        UsedItem savedItem = usedItemRepository.save(usedItem);

        UsedItemResponseDto response = UsedItemResponseDto.builder()
                .id(savedItem.getId())
                .memberId(member.getMemberId())
                .nickname(member.getNickname())
                .title(savedItem.getTitle())
                .description(savedItem.getDescription())
                .price(savedItem.getPrice())
                .status(savedItem.getStatus())
                .createdAt(savedItem.getCreatedAt())
                .updatedAt(savedItem.getUpdatedAt())
                .imageUrls(savedItem.getPhotos().stream().map(Photo::getFileUrl).toList())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 게시물 수정 (로그인 + 작성자 본인만)
    @Operation(summary = "중고 거래 게시물 수정")
    @PutMapping("/{id}")
    public ResponseEntity<UsedItemResponseDto> updateTrade(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody UsedItemRequestDto dto) {

        String token = extractToken(request);
        Long memberId = jwtTokenProvider.getMemberId(token);

        UsedItem usedItem = usedItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        if (!usedItem.getMember().getMemberId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 게시물만 수정할 수 있습니다.");
        }

        usedItem.setTitle(dto.getTitle());
        usedItem.setDescription(dto.getDescription());
        usedItem.setPrice(dto.getPrice());

        // 사진 수정 로직 개선
        if (dto.getPhotoIds() != null) { // null이면 → 프론트에서 수정 안 한 것
            usedItem.getPhotos().clear();
            if (!dto.getPhotoIds().isEmpty()) { // 비어있지 않으면 새 사진 교체
                List<Photo> newPhotos = photoRepository.findAllById(dto.getPhotoIds());
                newPhotos.forEach(usedItem::addPhoto);
            }
            // 비어 있으면 → 새 사진이 없다는 뜻이므로 그대로 clear 유지
        }

        UsedItem savedItem = usedItemRepository.save(usedItem);

        UsedItemResponseDto response = UsedItemResponseDto.builder()
                .id(savedItem.getId())
                .memberId(savedItem.getMember().getMemberId())
                .nickname(savedItem.getNickname())
                .title(savedItem.getTitle())
                .description(savedItem.getDescription())
                .price(savedItem.getPrice())
                .status(savedItem.getStatus())
                .createdAt(savedItem.getCreatedAt())
                .updatedAt(savedItem.getUpdatedAt())
                .imageUrls(savedItem.getPhotos().stream().map(Photo::getFileUrl).toList())
                .build();

        return ResponseEntity.ok(response);
    }

    // 게시물 삭제
    @Operation(summary = "중고 거래 게시물 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrade(
            HttpServletRequest request,
            @PathVariable Long id) {

        String token = extractToken(request);
        Long memberId = jwtTokenProvider.getMemberId(token);

        UsedItem usedItem = usedItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "삭제할 게시글을 찾을 수 없습니다."));

        if (!usedItem.getMember().getMemberId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 게시물만 삭제할 수 있습니다.");
        }

        usedItemRepository.delete(usedItem);
        return ResponseEntity.noContent().build();
    }

    // 토큰 추출 메서드
    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 토큰이 없습니다.");
        }
        return authHeader.substring(7);
    }
}

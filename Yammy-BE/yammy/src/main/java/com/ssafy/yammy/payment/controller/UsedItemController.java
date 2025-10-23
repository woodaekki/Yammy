package com.ssafy.yammy.payment.controller;

import com.ssafy.yammy.payment.dto.UsedItemRequestDto;
import com.ssafy.yammy.payment.dto.UsedItemResponseDto;
import com.ssafy.yammy.payment.entity.UsedItem;
import com.ssafy.yammy.payment.repository.UsedItemRepository;
// import com.ssafy.yammy.payment.entity.Member;
// import com.ssafy.yammy.payment.repository.MemberRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
public class UsedItemController {

    private final UsedItemRepository usedItemRepository;
    // private final MemberRepository memberRepository;  // TODO: Member 구현 후 활성화

    // 중고 거래 목록 전체 조회
    @GetMapping
    public ResponseEntity<List<UsedItemResponseDto>> getAllTrades() {
        List<UsedItem> items = usedItemRepository.findAll();

        // Entity → ResponseDto 변환
        List<UsedItemResponseDto> response = items.stream()
                .map(item -> UsedItemResponseDto.builder()
                        .id(item.getId())
                        // .memberId(item.getMember().getId())
                        .memberId(null)  // 임시
                        .nickname(item.getNickname())
                        .title(item.getTitle())
                        .description(item.getDescription())
                        .price(item.getPrice())
                        // .status(item.getStatus())
                        .createdAt(item.getCreatedAt())
                        .updatedAt(item.getUpdatedAt())
                        .imageUrls(item.getImageUrls())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 중고 거래 목록 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<UsedItemResponseDto> getTrade(@PathVariable Long id) {
        UsedItem item = usedItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다"));

        UsedItemResponseDto response = UsedItemResponseDto.builder()
                .id(item.getId())
                // .memberId(item.getMember().getId())
                .memberId(null)  // 임시
                .nickname(item.getNickname())
                .title(item.getTitle())
                .description(item.getDescription())
                .price(item.getPrice())
                // .status(item.getStatus())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .imageUrls(item.getImageUrls())
                .build();

        return ResponseEntity.ok(response);
    }

    // 중고 거래 목록 게시물 작성
    @PostMapping
    public ResponseEntity<UsedItemResponseDto> createTrade(
            @Valid @RequestBody UsedItemRequestDto dto,
            // @RequestHeader("Member-Id") Long memberId,
            @RequestHeader(value = "Nickname", required = false, defaultValue = "익명") String nickname) {  // 임시

        // Member member = memberRepository.findById(memberId)
        //         .orElseThrow(() -> new ResponseStatusException(
        //                 HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다"));

        UsedItem usedItem = new UsedItem();
        usedItem.setTitle(dto.getTitle());
        usedItem.setDescription(dto.getDescription());
        usedItem.setPrice(dto.getPrice());
        // usedItem.setStatus(true);
        usedItem.setImageUrls(dto.getImageUrls());
        // usedItem.setMember(member);
        // usedItem.setNickname(member.getNickname());
        usedItem.setNickname(nickname);  // 임시

        UsedItem savedItem = usedItemRepository.save(usedItem);

        // Entity → ResponseDto 변환
        UsedItemResponseDto response = UsedItemResponseDto.builder()
                .id(savedItem.getId())
                // .memberId(savedItem.getMember().getId())
                .memberId(null)  // 임시
                .nickname(savedItem.getNickname())
                .title(savedItem.getTitle())
                .description(savedItem.getDescription())
                .price(savedItem.getPrice())
                // .status(savedItem.getStatus())
                .createdAt(savedItem.getCreatedAt())
                .updatedAt(savedItem.getUpdatedAt())
                .imageUrls(savedItem.getImageUrls())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response); // json의 바디 형태 반환
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsedItemResponseDto> updateTrade(
            @PathVariable Long id,
            @Valid @RequestBody UsedItemRequestDto dto) {

        UsedItem usedItem = usedItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다"));

        // DTO 데이터로 Entity 업데이트
        usedItem.setTitle(dto.getTitle());
        usedItem.setDescription(dto.getDescription());
        usedItem.setPrice(dto.getPrice());

        if (dto.getImageUrls() != null) {
            usedItem.setImageUrls(dto.getImageUrls());
        }

        UsedItem savedItem = usedItemRepository.save(usedItem);

        // Entity → ResponseDto 변환
        UsedItemResponseDto response = UsedItemResponseDto.builder()
                .id(savedItem.getId())
                // .memberId(savedItem.getMember().getId())
                .memberId(null)  // 임시
                .nickname(savedItem.getNickname())
                .title(savedItem.getTitle())
                .description(savedItem.getDescription())
                .price(savedItem.getPrice())
                // .status(savedItem.getStatus())
                .createdAt(savedItem.getCreatedAt())
                .updatedAt(savedItem.getUpdatedAt())
                .imageUrls(savedItem.getImageUrls())
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrade(@PathVariable Long id) {
        if (!usedItemRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "삭제할 게시글을 찾을 수 없습니다");
        }
        usedItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
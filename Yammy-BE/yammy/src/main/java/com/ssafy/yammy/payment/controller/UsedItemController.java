package com.ssafy.yammy.payment.controller;

import com.ssafy.yammy.payment.dto.UsedItemRequestDto;
import com.ssafy.yammy.payment.dto.UsedItemResponseDto;
import com.ssafy.yammy.payment.entity.Photo;
import com.ssafy.yammy.payment.entity.UsedItem;
import com.ssafy.yammy.payment.repository.PhotoRepository;
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
    private final PhotoRepository photoRepository;
    // private final MemberRepository memberRepository;  // Member 구현 후 활성화

    // 중고 거래 전체 조회
    @GetMapping
    public ResponseEntity<List<UsedItemResponseDto>> getAllTrades() {
        List<UsedItem> items = usedItemRepository.findAll();

        List<UsedItemResponseDto> response = items.stream()
                .map(item -> {
                    List<String> imageUrls = item.getPhotos().stream()
                            .map(Photo::getFileUrl)
                            .toList();

                    return UsedItemResponseDto.builder()
                            .id(item.getId())
                            .memberId(null) // member 연동 후 수정
                            .nickname(item.getNickname())
                            .title(item.getTitle())
                            .description(item.getDescription())
                            .price(item.getPrice())
                            .status(item.getStatus())
                            .createdAt(item.getCreatedAt())
                            .updatedAt(item.getUpdatedAt())
                            .imageUrls(imageUrls)
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 중고 거래 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<UsedItemResponseDto> getTrade(@PathVariable Long id) {
        UsedItem item = usedItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        List<String> imageUrls = item.getPhotos().stream()
                .map(Photo::getFileUrl)
                .toList();

        UsedItemResponseDto response = UsedItemResponseDto.builder()
                .id(item.getId())
                .memberId(null)
                .nickname(item.getNickname())
                .title(item.getTitle())
                .description(item.getDescription())
                .price(item.getPrice())
                .status(item.getStatus())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .imageUrls(imageUrls)
                .build();

        return ResponseEntity.ok(response);
    }

    // 게시물 작성
    @PostMapping
    public ResponseEntity<UsedItemResponseDto> createTrade(
            @Valid @RequestBody UsedItemRequestDto dto,
            @RequestHeader(value = "Nickname", required = false, defaultValue = "익명") String nickname) { // 추후 member 코드 구현 후 수정 예정

        UsedItem usedItem = new UsedItem();
        usedItem.setTitle(dto.getTitle());
        usedItem.setDescription(dto.getDescription());
        usedItem.setPrice(dto.getPrice());
        usedItem.setNickname(nickname);

        // Photo 연결 (photoIds 기준)
        if (dto.getPhotoIds() != null && !dto.getPhotoIds().isEmpty()) {
            List<Photo> photos = photoRepository.findAllById(dto.getPhotoIds());
            photos.forEach(usedItem::addPhoto);
        }

        UsedItem savedItem = usedItemRepository.save(usedItem);

        List<String> imageUrls = savedItem.getPhotos().stream()
                .map(Photo::getFileUrl)
                .toList();

        UsedItemResponseDto response = UsedItemResponseDto.builder()
                .id(savedItem.getId())
                .memberId(null)
                .nickname(savedItem.getNickname())
                .title(savedItem.getTitle())
                .description(savedItem.getDescription())
                .price(savedItem.getPrice())
                .status(savedItem.getStatus())
                .createdAt(savedItem.getCreatedAt())
                .updatedAt(savedItem.getUpdatedAt())
                .imageUrls(imageUrls)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 게시물 수정
    @PutMapping("/{id}")
    public ResponseEntity<UsedItemResponseDto> updateTrade(
            @PathVariable Long id,
            @Valid @RequestBody UsedItemRequestDto dto) {

        UsedItem usedItem = usedItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        usedItem.setTitle(dto.getTitle());
        usedItem.setDescription(dto.getDescription());
        usedItem.setPrice(dto.getPrice());

        // 기존 사진 교체 (photoIds 기준)
        if (dto.getPhotoIds() != null) {
            usedItem.getPhotos().clear(); // 기존 관계 제거
            List<Photo> newPhotos = photoRepository.findAllById(dto.getPhotoIds());
            newPhotos.forEach(usedItem::addPhoto);
        }

        UsedItem savedItem = usedItemRepository.save(usedItem);

        List<String> imageUrls = savedItem.getPhotos().stream()
                .map(Photo::getFileUrl)
                .toList();

        UsedItemResponseDto response = UsedItemResponseDto.builder()
                .id(savedItem.getId())
                .memberId(null)
                .nickname(savedItem.getNickname())
                .title(savedItem.getTitle())
                .description(savedItem.getDescription())
                .price(savedItem.getPrice())
                .status(savedItem.getStatus())
                .createdAt(savedItem.getCreatedAt())
                .updatedAt(savedItem.getUpdatedAt())
                .imageUrls(imageUrls)
                .build();

        return ResponseEntity.ok(response);
    }

    // 게시물 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrade(@PathVariable Long id) {
        UsedItem usedItem = usedItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "삭제할 게시글을 찾을 수 없습니다."));

        usedItemRepository.delete(usedItem);

        return ResponseEntity.noContent().build();
    }
}

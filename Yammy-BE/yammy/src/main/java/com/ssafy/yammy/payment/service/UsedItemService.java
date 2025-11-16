package com.ssafy.yammy.payment.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.config.JwtTokenProvider;
import com.ssafy.yammy.global.util.BadWordsFilterUtil;
import com.ssafy.yammy.payment.dto.UsedItemRequestDto;
import com.ssafy.yammy.payment.dto.UsedItemResponseDto;
import com.ssafy.yammy.payment.entity.Photo;
import com.ssafy.yammy.payment.entity.Team;
import com.ssafy.yammy.payment.entity.UsedItem;
import com.ssafy.yammy.payment.repository.PhotoRepository;
import com.ssafy.yammy.payment.repository.UsedItemRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsedItemService {

    private final UsedItemRepository usedItemRepository;
    private final PhotoRepository photoRepository;
    private final PhotoService photoService;
    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final BadWordsFilterUtil badWordsFilterUtil;

    // 전체 조회
    // Pageable은 페이지 번호와 크기를 자동으로 받아오는 객체
    public Page<UsedItemResponseDto> getAllTrades(Pageable pageable) {
        return usedItemRepository.findAll(pageable)
                .map(item -> UsedItemResponseDto.builder()
                        .id(item.getId())
                        .memberId(item.getMember() != null ? item.getMember().getMemberId() : null)
                        .nickname(item.getNickname())
                        .title(item.getTitle())
                        .description(item.getDescription())
                        .price(item.getPrice())
                        .status(item.getStatus())
                        .team(item.getTeam())
                        .profileUrl(item.getMember() != null ? item.getMember().getProfileImage() : null)
                        .createdAt(item.getCreatedAt())
                        .updatedAt(item.getUpdatedAt())
                        .imageUrls(item.getPhotos().stream().map(Photo::getFileUrl).toList())
                        .build());
    }

    // 단건 조회
    public UsedItemResponseDto getTrade(Long id) {
        UsedItem item = usedItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        return UsedItemResponseDto.builder()
                .id(item.getId())
                .memberId(item.getMember() != null ? item.getMember().getMemberId() : null)
                .nickname(item.getNickname())
                .title(item.getTitle())
                .description(item.getDescription())
                .price(item.getPrice())
                .status(item.getStatus())
                .team(item.getTeam())
                .profileUrl(item.getMember() != null ? item.getMember().getProfileImage() : null)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .imageUrls(item.getPhotos().stream().map(Photo::getFileUrl).toList())
                .build();
    }

    // 게시물 작성
    public UsedItemResponseDto createTrade(HttpServletRequest request, UsedItemRequestDto dto, List<MultipartFile> imageFiles) {
        String token = extractToken(request);
        Long memberId = jwtTokenProvider.getMemberId(token);

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 회원입니다."));

        if (dto.getTeam() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "팀을 선택해야 합니다.");
        }

        // 게시물 작성 시 제목 및 글 내용 욕설 필터링
        String cleanTitle = badWordsFilterUtil.maskBadWords(dto.getTitle());
        String cleanDesc = badWordsFilterUtil.maskBadWords(dto.getDescription());

        UsedItem usedItem = new UsedItem();
        usedItem.setMember(member);
        usedItem.setNickname(member.getNickname());
        usedItem.setTitle(cleanTitle);
        usedItem.setDescription(cleanDesc);
        usedItem.setPrice(dto.getPrice());
        usedItem.setTeam(dto.getTeam());

        // 사진 연결
        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile imageFile : imageFiles) {
                String fileUrl = photoService.uploadPhoto(imageFile, "useditem");
                Photo photo = new Photo();
                photo.setMember(member);
                photo.setFileUrl(fileUrl);
                photo.setS3Key(extractS3KeyFromUrl(fileUrl));
                photo.setContentType(imageFile.getContentType());
                usedItem.addPhoto(photo);
            }
        }

        UsedItem savedItem = usedItemRepository.save(usedItem);

        // 게시글 작성 보상: EXP 10
        member.increaseExp(50L);
        memberRepository.save(member);

        return UsedItemResponseDto.builder()
                .id(savedItem.getId())
                .memberId(member.getMemberId())
                .nickname(member.getNickname())
                .title(savedItem.getTitle())
                .description(savedItem.getDescription())
                .price(savedItem.getPrice())
                .status(savedItem.getStatus())
                .team(savedItem.getTeam())
                .createdAt(savedItem.getCreatedAt())
                .updatedAt(savedItem.getUpdatedAt())
                .imageUrls(savedItem.getPhotos().stream().map(Photo::getFileUrl).toList())
                .build();
    }

    // 게시물 수정
    public UsedItemResponseDto updateTrade(HttpServletRequest request, Long id, UsedItemRequestDto dto) {
        String token = extractToken(request);
        Long memberId = jwtTokenProvider.getMemberId(token);

        UsedItem usedItem = usedItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));

        if (!usedItem.getMember().getMemberId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 게시물만 수정할 수 있습니다.");
        }

        if (dto.getTeam() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "팀을 선택해야 합니다.");
        }

        // 게시물 수정 시 제목 및 글 내용 욕설 필터링
        String cleanTitle = badWordsFilterUtil.maskBadWords(dto.getTitle());
        String cleanDesc = badWordsFilterUtil.maskBadWords(dto.getDescription());

        usedItem.setTitle(cleanTitle);
        usedItem.setDescription(cleanDesc);
        usedItem.setPrice(dto.getPrice());
        usedItem.setTeam(dto.getTeam());

        // 사진 수정 로직 그대로
        if (dto.getPhotoIds() != null) {
            usedItem.getPhotos().clear();
            if (!dto.getPhotoIds().isEmpty()) {
                List<Photo> newPhotos = photoRepository.findAllById(dto.getPhotoIds());
                newPhotos.forEach(usedItem::addPhoto);
            }
        }

        UsedItem savedItem = usedItemRepository.save(usedItem);

        return UsedItemResponseDto.builder()
                .id(savedItem.getId())
                .memberId(savedItem.getMember().getMemberId())
                .nickname(savedItem.getNickname())
                .title(savedItem.getTitle())
                .description(savedItem.getDescription())
                .price(savedItem.getPrice())
                .status(savedItem.getStatus())
                .team(savedItem.getTeam())
                .createdAt(savedItem.getCreatedAt())
                .updatedAt(savedItem.getUpdatedAt())
                .imageUrls(savedItem.getPhotos().stream().map(Photo::getFileUrl).toList())
                .build();
    }

    // 게시물 삭제
    public void deleteTrade(HttpServletRequest request, Long id) {
        String token = extractToken(request);
        Long memberId = jwtTokenProvider.getMemberId(token);

        UsedItem usedItem = usedItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "삭제할 게시글을 찾을 수 없습니다."));

        if (!usedItem.getMember().getMemberId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 게시물만 삭제할 수 있습니다.");
        }

        usedItemRepository.delete(usedItem);
    }

    // 검색
    public List<UsedItemResponseDto> searchUsedItems(String keyword, Team team) {
        List<UsedItem> items = usedItemRepository.searchUsedItems(keyword, team);
        return items.stream()
                .map(item -> UsedItemResponseDto.builder()
                        .id(item.getId())
                        .memberId(item.getMember() != null ? item.getMember().getMemberId() : null)
                        .nickname(item.getNickname())
                        .title(item.getTitle())
                        .description(item.getDescription())
                        .price(item.getPrice())
                        .status(item.getStatus())
                        .team(item.getTeam())
                        .profileUrl(item.getMember() != null ? item.getMember().getProfileImage() : null)
                        .createdAt(item.getCreatedAt())
                        .updatedAt(item.getUpdatedAt())
                        .imageUrls(item.getPhotos().stream().map(Photo::getFileUrl).toList())
                        .build())
                .collect(Collectors.toList());
    }

    // 토큰 추출 (기존 방식 그대로)
    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 토큰이 없습니다.");
        }
        return authHeader.substring(7);
    }

    // S3 URL에서 S3 Key 추출
    private String extractS3KeyFromUrl(String fileUrl) {
        // URL: https://bucket.s3.amazonaws.com/useditem/uuid.jpg
        // S3Key: useditem/uuid.jpg
        String[] parts = fileUrl.split(".s3.amazonaws.com/");
        if (parts.length > 1) {
            return parts[1];
        }
        return fileUrl;
    }
}

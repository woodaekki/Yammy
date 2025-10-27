package com.ssafy.yammy.payment.controller;

import com.ssafy.yammy.payment.dto.PhotoResponse;
import com.ssafy.yammy.payment.dto.PhotoUploadCompleteRequest;
import com.ssafy.yammy.payment.dto.PhotoUploadCompleteResponse;
import com.ssafy.yammy.payment.dto.PhotoUploadRequest;
import com.ssafy.yammy.payment.dto.PhotoUploadResponse;
import com.ssafy.yammy.payment.service.PhotoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(name = "S3 API", description = "중고거래 S3 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/photos")
public class PhotoController {

    private final PhotoService photoService;

    // presignedUrl로 사용자에게 업로드 요청
    // 여러 presigned URL 한 번에 요청
    @Operation(summary = "presignedUrl 동시 요청")
    @PostMapping("/presignedUrls")
    public ResponseEntity<List<PhotoUploadResponse>> getMultipleUploadUrls(
            @RequestBody List<PhotoUploadRequest> requests) {

        List<PhotoUploadResponse> responses = requests.stream()
                .map(req -> photoService.getGalleryPresignedUploadUrl(
                        req.getMemberId(), req.getOriginalFilename(), req.getContentType()))
                .toList();

        return ResponseEntity.ok(responses);
    }

    // 단건 조회
    @Operation(summary = "photoId 단건 조회")
    @GetMapping("/{photoId}")
    public ResponseEntity<PhotoResponse> getPhoto(@PathVariable Long photoId) {
        PhotoResponse response = photoService.getPhoto(photoId);
        return ResponseEntity.ok(response);
    }

    // 업로드 완료
    @PostMapping("/complete")
    @Operation(summary = "photoId 업로드 완료")
    public ResponseEntity<PhotoUploadCompleteResponse> completeUpload(
            @RequestBody PhotoUploadCompleteRequest request) {
        PhotoUploadCompleteResponse result = photoService.completeUpload(request);
        return ResponseEntity.ok(result);
    }

    // 단건 삭제
    @DeleteMapping("/{photoId}")
    @Operation(summary = "photoId 단건 삭제")
    public ResponseEntity<String> deletePhoto(@PathVariable Long photoId) {
        photoService.deletePhoto(photoId);
        return ResponseEntity.ok("사진 삭제 성공");
    }

}
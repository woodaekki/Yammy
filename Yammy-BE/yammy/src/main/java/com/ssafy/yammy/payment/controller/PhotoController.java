package com.ssafy.yammy.payment.controller;

import com.ssafy.yammy.payment.dto.PhotoUploadCompleteRequest;
import com.ssafy.yammy.payment.dto.PhotoUploadResponse;
import com.ssafy.yammy.payment.entity.Photo;
import com.ssafy.yammy.payment.service.PhotoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
@Tag(name = "Photo API", description = "사진 업로드 관련 API")
@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    // Presigned URL 발급
    @Operation(summary = "S3 업로드용 Presigned URL 발급")
    @PostMapping("/presignedUrls")
    public ResponseEntity<List<PhotoUploadResponse>> getPresignedUrls(
            @RequestParam int count,
            @RequestParam String contentType,
            @RequestParam(defaultValue = "useditem") String prefix) {

        log.info("Presigned URL 요청 - count: {}, contentType: {}, prefix: {}", count, contentType, prefix);
        List<PhotoUploadResponse> responses = photoService.generatePresignedUrls(count, contentType, prefix);
        return ResponseEntity.ok(responses);
    }

    // S3 업로드 완료 후 DB 저장 및 photoId 반환
    @Operation(summary = "S3 업로드 완료 후 DB 저장 및 photoId 반환")
    @PostMapping("/complete")
    public ResponseEntity<Map<String, Object>> completeUpload(
            HttpServletRequest request,
            @Valid @RequestBody PhotoUploadCompleteRequest dto) {

        Photo photo = photoService.completeUpload(request, dto);
        Map<String, Object> response = Map.of(
                "photoId", photo.getId(),
                "fileUrl", photo.getFileUrl()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

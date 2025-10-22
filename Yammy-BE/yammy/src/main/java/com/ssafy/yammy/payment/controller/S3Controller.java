package com.ssafy.yammy.payment.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URL;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/s3")
@RequiredArgsConstructor
public class S3Controller {

    private final S3Presigner s3Presigner;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${spring.cloud.aws.region.static}")
    private String region;

    @GetMapping("/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(
            @RequestParam String fileName
    ) {
        try {
            String key = "used-items/" + fileName; // S3 내 저장 경로

            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType("image/jpeg")
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(3)) // 3분간 유효
                    .putObjectRequest(objectRequest)
                    .build();

            URL presignedUrl = s3Presigner.presignPutObject(presignRequest).url();

            Map<String, String> response = new HashMap<>();
            response.put("uploadUrl", presignedUrl.toString());
            response.put("fileUrl", "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + key);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "URL 생성 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

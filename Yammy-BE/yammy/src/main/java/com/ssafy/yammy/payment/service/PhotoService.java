package com.ssafy.yammy.payment.service;

import com.ssafy.yammy.payment.config.PhotoConfig;
import com.ssafy.yammy.payment.dto.*;
import com.ssafy.yammy.payment.entity.Photo;
import com.ssafy.yammy.payment.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URL;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoConfig photoConfig;
    private final PhotoRepository photoRepository;

    // presigned URL 생성
    public PhotoUploadResponse getGalleryPresignedUploadUrl(Long memberId, String originalFilename, String contentType) {
        validateFile(originalFilename, contentType);

        try (S3Presigner presigner = createPresigner()) {
            String folderName = (memberId != null) ? "members/" + memberId : "anonymous";
            String subFolder = "gallery";
            String extension = extractExtension(originalFilename);

            String key = String.format("%s/%s/%s%s",
                    folderName,
                    subFolder,
                    UUID.randomUUID(),
                    extension);

            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(photoConfig.getBucketName())
                    .key(key)
                    .contentType(contentType)
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(20))
                    .putObjectRequest(objectRequest)
                    .build();

            URL presignedUrl = presigner.presignPutObject(presignRequest).url();
            String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s",
                    photoConfig.getBucketName(),
                    photoConfig.getRegion(),
                    key);

            return new PhotoUploadResponse(presignedUrl.toString(), fileUrl);
        }
    }

    public PhotoUploadCompleteResponse completeUpload(PhotoUploadCompleteRequest request) {
        Photo photo = Photo.builder()
                .fileUrl(request.getFileUrl())
                .s3Key(extractKeyFromUrl(request.getFileUrl()))
                .contentType("image/jpeg")
                .build();

        photoRepository.save(photo);
        return new PhotoUploadCompleteResponse(photo.getId(), photo.getFileUrl());
    }

    public PhotoResponse getPhoto(Long id) {
        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사진을 찾을 수 없습니다."));
        return new PhotoResponse(photo.getId(), photo.getFileUrl());
    }

    public void deletePhoto(Long id) {
        if (!photoRepository.existsById(id)) {
            throw new IllegalArgumentException("삭제할 사진이 존재하지 않습니다.");
        }
        photoRepository.deleteById(id);
    }

    private void validateFile(String originalFilename, String contentType) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("파일 이름이 비어 있습니다.");
        }
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }
    }

    private String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex > 0) ? filename.substring(dotIndex) : "";
    }

    private String extractKeyFromUrl(String fileUrl) {
        int idx = fileUrl.indexOf(".com/");
        return idx > 0 ? fileUrl.substring(idx + 5) : fileUrl;
    }

    private S3Presigner createPresigner() {
        return S3Presigner.builder()
                .region(Region.of(photoConfig.getRegion()))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(
                                        photoConfig.getAccessKey(),
                                        photoConfig.getSecretKey()
                                )
                        )
                )
                .build();
    }
}

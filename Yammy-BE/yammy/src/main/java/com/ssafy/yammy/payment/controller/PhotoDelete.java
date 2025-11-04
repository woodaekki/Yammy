package com.ssafy.yammy.payment.controller;

import com.ssafy.yammy.payment.entity.Photo;
import com.ssafy.yammy.payment.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

import java.time.LocalDateTime;
import java.util.List;

@Component // 스케줄러 체크 용도
@RequiredArgsConstructor
@Slf4j // 로그 출력용
public class PhotoDelete {

    private final PhotoRepository photoRepository;
    private final S3Client s3Client; // 실제 삭제용

    @Value("${AWS_S3_BUCKET}")
    private String bucketName;

    @Scheduled(cron = "0 0 2 * * *") // 매일 새벽 3시마다
//    @Scheduled(fixedRate = 60000) // 1분 마다 실행 (테스트용)
    public void cleanUpTemporaryPhotos() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(12); // 12시간 마다
//        LocalDateTime threshold = LocalDateTime.now().minusMinutes(2); // 2분 마다 파일 삭제 (테스트용)
        List<Photo> oldTemporaryPhotos = photoRepository.findByTemporaryTrueAndCreatedAtBefore(threshold);

        for (Photo photo : oldTemporaryPhotos) {
            try {
                s3Client.deleteObject(DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(photo.getS3Key())
                        .build());
                photoRepository.delete(photo);
                log.info("삭제된 임시 사진: {}", photo.getFileUrl());
            } catch (Exception e) {
                log.warn("S3 임시 사진 삭제 실패: {}", photo.getFileUrl(), e);
            }
        }
    }
}

package com.ssafy.yammy.payment.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.config.JwtTokenProvider;
import com.ssafy.yammy.payment.dto.PhotoUploadCompleteRequest;
import com.ssafy.yammy.payment.dto.PhotoUploadResponse;
import com.ssafy.yammy.payment.entity.Photo;
import com.ssafy.yammy.payment.repository.PhotoRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhotoService {

    private final S3Presigner s3Presigner;
    private final PhotoRepository photoRepository;
    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${AWS_S3_BUCKET}")
    private String bucketName;

    // Presigned URL 생성 (기본: useditem 폴더)
    public List<PhotoUploadResponse> generatePresignedUrls(int count, String contentType) {
        return generatePresignedUrls(count, contentType, "useditem");
    }

    // Presigned URL 생성 (폴더 경로 지정 가능)
    public List<PhotoUploadResponse> generatePresignedUrls(int count, String contentType, String prefix) {
        return IntStream.range(0, count)
                .mapToObj(i -> {
                    String s3Key = prefix + "/" + UUID.randomUUID() + ".jpg";

                    PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                            .contentType(contentType)
                            .build();

                    PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(
                            r -> r.signatureDuration(Duration.ofMinutes(10))
                                    .putObjectRequest(putObjectRequest)
                    );

                    return PhotoUploadResponse.builder()
                            .s3Key(s3Key)
                            .presignedUrl(presignedRequest.url().toString())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // 업로드 완료 시 DB에 Photo 저장하고 Photo 반환
    public Photo completeUpload(HttpServletRequest request, PhotoUploadCompleteRequest dto) {
        String token = extractToken(request);
        Long memberId = jwtTokenProvider.getMemberId(token);

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 회원입니다."));

        if (dto.getFileUrl() == null || dto.getFileUrl().isBlank()) {
            throw new IllegalArgumentException("파일 URL이 없습니다.");
        }

        Photo photo = new Photo();
        photo.setMember(member);
        photo.setS3Key(dto.getS3Key());
        photo.setFileUrl(dto.getFileUrl());
        photo.setContentType(dto.getContentType());
        photo.setTemporary(true);

        return photoRepository.save(photo);
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 토큰이 없습니다.");
        }
        return authHeader.substring(7);
    }
}

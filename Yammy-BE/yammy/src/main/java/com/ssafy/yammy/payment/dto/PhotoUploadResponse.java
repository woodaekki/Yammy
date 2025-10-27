package com.ssafy.yammy.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PhotoUploadResponse {
    private String presignedUrl; // 실제 S3 업로드용 URL
    private String fileUrl;      // 업로드 완료 후 URL (DB 접근용)
}

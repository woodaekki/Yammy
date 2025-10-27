package com.ssafy.yammy.payment.dto;

import lombok.Getter;

@Getter
public class PhotoUploadCompleteRequest {
    private Long memberId;
    private String fileUrl; // 업로드 완료된 S3 URL
}

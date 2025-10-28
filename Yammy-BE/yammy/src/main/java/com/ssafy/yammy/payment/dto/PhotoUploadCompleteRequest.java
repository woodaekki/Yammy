package com.ssafy.yammy.payment.dto;

import lombok.Getter;
import java.util.List;

@Getter
public class PhotoUploadCompleteRequest {
    private Long memberId;
    private List<String> fileUrls; // 업로드 완료된 S3 URL
}

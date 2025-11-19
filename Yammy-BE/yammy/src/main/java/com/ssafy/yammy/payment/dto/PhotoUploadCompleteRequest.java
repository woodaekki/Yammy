package com.ssafy.yammy.payment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PhotoUploadCompleteRequest {

    @NotBlank(message = "S3 키는 필수입니다.")
    private String s3Key;

    @NotBlank(message = "파일 URL이 필요합니다.")
    private String fileUrl;

    @NotBlank(message = "파일 형식은 필수입니다.")
    private String contentType;

    @Builder
    public PhotoUploadCompleteRequest(String s3Key, String fileUrl, String contentType) {
        this.s3Key = s3Key;
        this.fileUrl = fileUrl;
        this.contentType = contentType;
    }
}

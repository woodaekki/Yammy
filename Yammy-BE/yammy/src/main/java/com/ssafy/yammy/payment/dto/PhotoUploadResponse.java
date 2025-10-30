package com.ssafy.yammy.payment.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PhotoUploadResponse {

    private String s3Key;
    private String presignedUrl;

    @Builder
    public PhotoUploadResponse(String s3Key, String presignedUrl) {
        this.s3Key = s3Key;
        this.presignedUrl = presignedUrl;
    }
}

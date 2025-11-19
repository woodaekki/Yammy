package com.ssafy.yammy.payment.dto;

import lombok.Getter;

@Getter
public class PhotoUploadRequest {
    private String originalFilename;
    private String contentType;
}
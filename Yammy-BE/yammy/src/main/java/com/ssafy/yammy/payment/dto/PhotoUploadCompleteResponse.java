// PhotoUploadCompleteResponse.java
package com.ssafy.yammy.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PhotoUploadCompleteResponse {
    private Long photoId;
    private String fileUrl;
}

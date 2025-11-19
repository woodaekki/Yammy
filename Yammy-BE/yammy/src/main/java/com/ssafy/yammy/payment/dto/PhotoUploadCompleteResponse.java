// PhotoUploadCompleteResponse.java
package com.ssafy.yammy.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class PhotoUploadCompleteResponse {
//    private List<Long> photoIds;
    private List<String> fileUrls;
}

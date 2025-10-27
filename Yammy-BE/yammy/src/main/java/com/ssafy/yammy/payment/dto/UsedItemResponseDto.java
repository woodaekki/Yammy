package com.ssafy.yammy.payment.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class UsedItemResponseDto {

    private Long id;
    private Long memberId;
    private String nickname;
    private String title;
    private String description;
    private Integer price;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> imageUrls;

}

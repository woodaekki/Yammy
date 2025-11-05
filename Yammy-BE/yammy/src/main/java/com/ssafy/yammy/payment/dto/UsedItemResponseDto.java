package com.ssafy.yammy.payment.dto;

import com.ssafy.yammy.payment.entity.Team;
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
    private Team team;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String profileUrl;
    private List<String> imageUrls;

}

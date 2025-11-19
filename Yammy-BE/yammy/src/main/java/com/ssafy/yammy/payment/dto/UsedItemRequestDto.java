package com.ssafy.yammy.payment.dto;

import com.ssafy.yammy.payment.entity.Team;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class UsedItemRequestDto {

    @NotBlank(message = "제목을 입력해주세요")
    @Size(min = 2, max = 50, message = "제목은 2자 이상 50자 이하여야 합니다")
    private String title;

    @NotBlank(message = "설명을 입력해주세요")
    @Size(min = 10, max = 1000, message = "설명은 10자 이상 1,000자 이하여야 합니다")
    private String description;

    @NotNull(message = "가격을 입력해주세요")
    @Min(value = 1, message = "가격은 1원 이상이어야 합니다")
    @Max(value = 1000000000, message = "가격은 10억원 이하여야 합니다")
    private Integer price;

    @NotNull(message = "팀을 선택해주세요")
    private Team team;

    private Boolean status;

    // 업로드 완료된 사진들의 photoId 리스트
    @Size(max = 3, message = "이미지는 최대 3장까지 등록 가능합니다")
    private List<Long> photoIds;

    @Builder
    public UsedItemRequestDto(String title,
                              Integer price,
                              String description,
                              Team team,
                              List<Long> photoIds) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.team = team;
        this.photoIds = photoIds;
    }

}
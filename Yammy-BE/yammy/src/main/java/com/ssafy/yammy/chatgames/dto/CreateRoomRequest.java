package com.ssafy.yammy.chatgames.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateRoomRequest {
    @Size(max = 50, message = "채팅방 키는 50자를 초과할 수 없습니다")
    private String roomKey;  // 선택 (없으면 자동 생성)

    @NotBlank(message = "채팅방 이름은 필수입니다")
    @Size(max = 30, message = "채팅방 이름은 30자를 초과할 수 없습니다")
    private String name;

    private String homeTeam;
    private String awayTeam;
    private Boolean doubleHeader;

    @NotNull(message = "경기 시작 시간은 필수입니다")
    private LocalDateTime startAt;
}
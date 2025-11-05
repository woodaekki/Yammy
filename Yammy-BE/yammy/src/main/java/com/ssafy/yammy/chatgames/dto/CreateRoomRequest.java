package com.ssafy.yammy.chatgames.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateRoomRequest {
    private String roomKey;  // 선택 (없으면 자동 생성)
    private String name;
    private String homeTeam;
    private String awayTeam;
    private Boolean doubleHeader;
    private LocalDateTime startAt;
}
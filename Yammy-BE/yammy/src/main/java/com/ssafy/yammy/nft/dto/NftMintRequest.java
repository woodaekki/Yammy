package com.ssafy.yammy.nft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NftMintRequest {
    private Long ticketId;
    private String walletAddress;
}

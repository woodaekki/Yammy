package com.ssafy.yammy.nft.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NftMintResponse {
    private boolean success;
    private Long tokenId;
    private String metadataUri;
    private String transactionHash;
    private String imageIpfsHash;  // IPFS 이미지 해시
    private String errorMessage;
}

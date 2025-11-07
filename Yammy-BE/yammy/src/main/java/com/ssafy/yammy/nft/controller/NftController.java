package com.ssafy.yammy.nft.controller;

import com.ssafy.yammy.config.CustomUserDetails;
import com.ssafy.yammy.nft.dto.NftMintRequest;
import com.ssafy.yammy.nft.dto.NftMintResponse;
import com.ssafy.yammy.nft.service.NftService;
import com.ssafy.yammy.ticket.entity.Ticket;
import com.ssafy.yammy.ticket.repository.TicketRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/nft")
@RequiredArgsConstructor
@Tag(name = "NFT", description = "NFT 발급 API")
public class NftController {

    private final NftService nftService;
    private final TicketRepository ticketRepository;

    /**
     * 기존 티켓에 대한 NFT 발급 (커스터디 방식)
     * walletAddress가 없으면 서비스 지갑으로 발급
     */
    @PostMapping("/mint")
    @Operation(summary = "NFT 발급", description = "기존 티켓에 대해 NFT를 발급합니다. 지갑 주소가 없으면 서비스 지갑으로 발급됩니다.")
    public ResponseEntity<NftMintResponse> mintNft(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart("request") NftMintRequest request,
            @RequestPart(value = "photo", required = false) org.springframework.web.multipart.MultipartFile photo) {

        Long memberId = userDetails.getMemberId();
        log.info("NFT 발급 요청 - memberId: {}, ticketId: {}, walletAddress: {}",
                memberId, request.getTicketId(), request.getWalletAddress());

        // 티켓 조회 및 권한 확인
        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new RuntimeException("티켓을 찾을 수 없습니다."));

        if (!ticket.getMember().getMemberId().equals(memberId)) {
            throw new RuntimeException("권한이 없습니다.");
        }

        if (Boolean.TRUE.equals(ticket.getNftMinted())) {
            throw new RuntimeException("이미 NFT가 발급된 티켓입니다.");
        }

        // walletAddress가 없으면 null로 전달 (NftService에서 처리)
        String walletAddress = request.getWalletAddress();
        if (walletAddress != null && walletAddress.trim().isEmpty()) {
            walletAddress = null;
        }

        // NFT 발급
        NftMintResponse response = nftService.mintTicketNft(ticket, walletAddress, photo);

        if (response.isSuccess()) {
            // 성공: NFT 발급 완료 처리
            ticket.markNftMinted(
                    response.getTokenId(),
                    response.getMetadataUri(),
                    response.getTransactionHash()
            );

            // IPFS 이미지 해시 저장 (아직 없는 경우)
            if (response.getImageIpfsHash() != null && ticket.getIpfsImageHash() == null) {
                ticket.setIpfsImageHash(response.getImageIpfsHash());
            }

            ticketRepository.save(ticket);
            log.info("NFT 발급 성공 및 DB 저장 완료 - ticketId: {}", ticket.getTicketId());
        } else {
            // 실패: 중간 결과 저장 (재시도 시 재사용)
            boolean hasPartialResult = false;

            if (response.getImageIpfsHash() != null && ticket.getIpfsImageHash() == null) {
                ticket.setIpfsImageHash(response.getImageIpfsHash());
                hasPartialResult = true;
            }

            if (hasPartialResult) {
                ticketRepository.save(ticket);
                log.info("NFT 발급 실패했지만 중간 결과 저장 완료 - ticketId: {}, imageHash: {}",
                        ticket.getTicketId(), response.getImageIpfsHash());
            }

            log.warn("NFT 발급 실패 - ticketId: {}, error: {}", ticket.getTicketId(), response.getErrorMessage());
        }

        return ResponseEntity.ok(response);
    }
}

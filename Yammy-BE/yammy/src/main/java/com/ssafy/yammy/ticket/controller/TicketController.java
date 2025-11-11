package com.ssafy.yammy.ticket.controller;

import com.ssafy.yammy.config.CustomUserDetails;
import com.ssafy.yammy.payment.dto.PhotoUploadResponse;
import com.ssafy.yammy.payment.service.PhotoService;
import com.ssafy.yammy.ticket.dto.TicketRequest;
import com.ssafy.yammy.ticket.dto.TicketResponse;
import com.ssafy.yammy.ticket.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Ticket", description = "티켓 발급 API")
public class TicketController {

    private final TicketService ticketService;
    private final PhotoService photoService;

    /**
     * S3 Presigned URL 발급 (티켓 사진 업로드용)
     */
    @PostMapping("/presignedUrl")
    @Operation(summary = "티켓 사진 업로드용 Presigned URL 발급", description = "티켓 사진을 업로드하기 위한 Presigned URL을 발급합니다.")
    public ResponseEntity<PhotoUploadResponse> getPresignedUrl(
            @RequestParam(defaultValue = "image/jpeg") String contentType) {

        List<PhotoUploadResponse> responses = photoService.generatePresignedUrls(1, contentType, "ticket");
        return ResponseEntity.ok(responses.get(0));
    }

    /**
     * 티켓 생성
     */
    @PostMapping
    @Operation(summary = "티켓 발급", description = "새로운 티켓을 발급합니다.")
    public ResponseEntity<TicketResponse> createTicket(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart("ticket") TicketRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "mintNft", required = false, defaultValue = "false") boolean mintNft) {

        Long memberId = userDetails.getMemberId();
        log.info("티켓 발급 요청 - memberId: {}, game: {}, mintNft: {}", memberId, request.getGame(), mintNft);

        // 직관 사진을 S3에 업로드
        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            photoUrl = photoService.uploadPhoto(photo, "ticket");
            log.info("티켓 사진 S3 업로드 완료 - memberId: {}, photoUrl: {}", memberId, photoUrl);
        }

        TicketResponse response = ticketService.createTicket(memberId, request, photoUrl, mintNft);
        return ResponseEntity.ok(response);
    }

    /**
     * 내 티켓 목록 조회
     */
    @GetMapping
    @Operation(summary = "내 티켓 목록 조회", description = "로그인한 사용자의 티켓 목록을 조회합니다.")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long memberId = userDetails.getMemberId();
        log.info("티켓 목록 조회 요청 - memberId: {}", memberId);

        List<TicketResponse> tickets = ticketService.getMyTickets(memberId);
        return ResponseEntity.ok(tickets);
    }

    /**
     * 특정 사용자의 티켓 목록 조회
     */
    @GetMapping("/user/{memberId}")
    @Operation(summary = "특정 사용자 티켓 목록 조회", description = "특정 사용자의 티켓 목록을 조회합니다.")
    public ResponseEntity<List<TicketResponse>> getUserTickets(
            @PathVariable Long memberId) {

        log.info("사용자 티켓 목록 조회 요청 - memberId: {}", memberId);

        List<TicketResponse> tickets = ticketService.getMyTickets(memberId);
        return ResponseEntity.ok(tickets);
    }

    /**
     * 티켓 상세 조회
     */
    @GetMapping("/{ticketId}")
    @Operation(summary = "티켓 상세 조회", description = "특정 티켓의 상세 정보를 조회합니다.")
    public ResponseEntity<TicketResponse> getTicket(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long ticketId) {

        Long memberId = userDetails.getMemberId();
        log.info("티켓 상세 조회 요청 - ticketId: {}, memberId: {}", ticketId, memberId);

        TicketResponse ticket = ticketService.getTicket(ticketId, memberId);
        return ResponseEntity.ok(ticket);
    }

    /**
     * 티켓 수정
     */
    @PutMapping("/{ticketId}")
    @Operation(summary = "티켓 수정", description = "기존 티켓을 수정합니다.")
    public ResponseEntity<TicketResponse> updateTicket(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long ticketId,
            @RequestPart("ticket") TicketRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {

        Long memberId = userDetails.getMemberId();
        log.info("티켓 수정 요청 - ticketId: {}, memberId: {}", ticketId, memberId);

        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            // S3에 사진 업로드 (ticket 폴더)
            photoUrl = photoService.uploadPhoto(photo, "ticket");
        }

        TicketResponse response = ticketService.updateTicket(ticketId, memberId, request, photoUrl);
        return ResponseEntity.ok(response);
    }

    /**
     * 티켓 삭제
     */
    @DeleteMapping("/{ticketId}")
    @Operation(summary = "티켓 삭제", description = "티켓을 삭제합니다.")
    public ResponseEntity<Void> deleteTicket(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long ticketId) {

        Long memberId = userDetails.getMemberId();
        log.info("티켓 삭제 요청 - ticketId: {}, memberId: {}", ticketId, memberId);

        ticketService.deleteTicket(ticketId, memberId);
        return ResponseEntity.noContent().build();
    }
}

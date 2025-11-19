package com.ssafy.yammy.payment.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.payment.dto.TossPaymentRequest;
import com.ssafy.yammy.payment.dto.TossPaymentResponse;
import com.ssafy.yammy.payment.entity.Point;
import com.ssafy.yammy.payment.entity.PointTransaction;
import com.ssafy.yammy.payment.entity.TossPayment;
import com.ssafy.yammy.payment.entity.TransactionType;
import com.ssafy.yammy.payment.repository.PointRepository;
import com.ssafy.yammy.payment.repository.PointTransactionRepository;
import com.ssafy.yammy.payment.repository.TossPaymentRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value; // 환경 변수 주입용 어노테이션
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class TossPaymentService {

    @Value("${TEST_SECRET_KEY:}")
    private String tossSecretKey;

    @Value("${TOSS_URL:}")
    private String tossUrl;

    private final TossPaymentRepository tossPaymentRepository;
    private final PointRepository pointRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final MemberRepository memberRepository;
    private final PointTransactionService pointTransactionService;

    @Transactional
    // 결제 승인 요청 보내기
    public TossPaymentResponse confirmPayment(TossPaymentRequest request, Long memberId) {

        // Toss API 호출
        // 서비스용 키를 토스에서 요구하는 형태인 Base64 방식으로 인코딩
        String encodedKey = Base64.getEncoder()
                .encodeToString((tossSecretKey  + ":").getBytes());
        // Authorization: Basic + Base64 인코딩 키 형태의 헤더 만들기
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Basic " + encodedKey);
        // 객체 + 헤더로 묶기
        HttpEntity<TossPaymentRequest> httpEntity = new HttpEntity<>(request, headers);
        // Toss 서버에 요청 보내기
        // RestTemplate: 백엔드의 axios
        RestTemplate restTemplate = new RestTemplate();

        TossPaymentResponse responseBody = null;
        try {
            // Toss 서버에서 보낸 JSON → TossPaymentResponse 객체 형태로 변환
            ResponseEntity<TossPaymentResponse> response = restTemplate.exchange(
                    tossUrl, // 요청 보낼 주소
                    HttpMethod.POST,  // 요청 방식
                    httpEntity, // 요청 내용 (body + header)
                    TossPaymentResponse.class // 응답 받을 타입(class)
            );
            System.out.println("결제 승인 성공");
            responseBody = response.getBody(); // body는 객체 형태로 찍힘
        } catch (Exception e) {
            System.out.println("결제 승인 중 오류 발생");
            System.out.println(e);
            return null;
        }

        // DB에 결제 정보 저장
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        TossPayment tossPayment = new TossPayment();
        tossPayment.setMember(member);
        tossPayment.setOrderId(request.getOrderId());
        tossPayment.setPaymentKey(request.getPaymentKey());
        tossPayment.setAmount(request.getAmount());
        tossPayment.setStatus("DONE");
        tossPayment.setRequestedAt(LocalDateTime.now());
        tossPayment.setApprovedAt(LocalDateTime.now());
        tossPaymentRepository.save(tossPayment);

        // 포인트 계좌 확인/생성
        Long amount = request.getAmount();
        Point point = pointRepository.findByMember(member)
                .orElseGet(() -> {
                    Point newPoint = new Point();
                    newPoint.setMember(member);
                    newPoint.setBalance(0L);
                    return pointRepository.save(newPoint);
                });

        // 포인트 충전 (증감 + 로그를 함께 처리)
        pointTransactionService.recordChargeTransaction(member, amount);

        return responseBody;
    }
}

package com.ssafy.yammy.payment.service;

import com.ssafy.yammy.payment.dto.TossPaymentRequest;
import com.ssafy.yammy.payment.dto.TossPaymentResponse;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

@Service
public class TossPaymentService {

    // 토스 테스트용 시크릿키와 결제 승인 API 주소
    private static final String TEST_SECRET_KEY = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";
    private static final String TOSS_URL = "https://api.tosspayments.com/v1/payments/confirm";

    // 결제 승인 요청 보내기
    public TossPaymentResponse confirmPayment(TossPaymentRequest request) {

        // 서비스용 키를 토스에서 요구하는 형태인 Base64 방식으로 인코딩
        String encodedKey = Base64.getEncoder()
                .encodeToString((TEST_SECRET_KEY + ":").getBytes());

        // Authorization: Basic + Base64 인코딩 키 형태의 헤더 만들기
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Basic " + encodedKey);

        // 객체 + 헤더로 묶기
        HttpEntity<TossPaymentRequest> httpEntity = new HttpEntity<>(request, headers);

        // Toss 서버에 요청 보내기
        // RestTemplate: 백엔드의 axios
        RestTemplate restTemplate = new RestTemplate();

        try {
            // Toss 서버에서 보낸 JSON → TossPaymentResponse 객체 형태로 변환
            ResponseEntity<TossPaymentResponse> response = restTemplate.exchange(
                    TOSS_URL,            // 요청 보낼 주소
                    HttpMethod.POST,     // 요청 방식
                    httpEntity,          // 요청 내용 (body + header)
                    TossPaymentResponse.class // 응답 받을 타입(class)
            );

            System.out.println("결제 승인 성공");
            System.out.println(response.getBody()); // body는 객체 형태로 찍힘

            return response.getBody();

        } catch (Exception e) {
            System.out.println("결제 승인 중 오류 발생");
            System.out.println(e);
            return null;
        }
    }
}

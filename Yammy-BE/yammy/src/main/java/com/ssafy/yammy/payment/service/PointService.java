package com.ssafy.yammy.payment.service;

import com.ssafy.yammy.auth.entity.Member;
import com.ssafy.yammy.auth.repository.MemberRepository;
import com.ssafy.yammy.payment.dto.PointResponse;
import com.ssafy.yammy.payment.entity.Point;
import com.ssafy.yammy.payment.repository.PointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PointService {

    private final PointRepository pointRepository;
    private final MemberRepository memberRepository;

    // 내 포인트 조회
    public PointResponse getMyPoint(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 회원입니다."));

        // 기존 회원 중 Point 계좌가 없으면 자동 생성
        // 이미 존재하면 기존 데이터 그대로 가져오기
        Point myPoint = pointRepository.findByMember(member)
                .orElseGet(() -> {
                    Point newPoint = new Point();
                    newPoint.setMember(member);
                    newPoint.setBalance(0L);
                    newPoint.setUpdatedAt(java.time.LocalDateTime.now());
                    return pointRepository.save(newPoint);
                });

        return new PointResponse(myPoint.getBalance());
    }

    // 포인트 사용
    public PointResponse use(Long memberId, Long amount) {
        // 회원 검증
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 회원입니다."));
        // 포인트 계좌 검증
        Point myPoint = pointRepository.findByMember(member)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "포인트 계좌가 없습니다."));
        // 잔액 확인
        if (myPoint.getBalance() < amount) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잔액이 부족합니다.");
        }
        // 포인트 사용 차감 및 저장
        myPoint.setBalance(myPoint.getBalance() - amount);
        pointRepository.save(myPoint);

        return new PointResponse(myPoint.getBalance());
    }
}

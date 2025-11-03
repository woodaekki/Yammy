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

        Point myPoint = pointRepository.findByMember(member)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "포인트 계좌가 없습니다."));

        return new PointResponse(myPoint.getBalance());
    }

    // 포인트 사용
    public PointResponse use(Long memberId, Long amount) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "존재하지 않는 회원입니다."));

        Point myPoint = pointRepository.findByMember(member)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "포인트 계좌가 없습니다."));

        if (myPoint.getBalance() < amount) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잔액이 부족합니다.");
        }

        myPoint.setBalance(myPoint.getBalance() - amount);
        pointRepository.save(myPoint);

        return new PointResponse(myPoint.getBalance());
    }
}

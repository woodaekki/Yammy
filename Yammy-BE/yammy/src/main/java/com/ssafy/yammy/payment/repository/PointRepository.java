package com.ssafy.yammy.payment.repository;

import com.ssafy.yammy.auth.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import com.ssafy.yammy.payment.entity.Point;
import java.util.Optional;

public interface PointRepository extends JpaRepository<Point,Long> {
    Optional<Point> findByMember(Member member); // 회원으로 포인트 계좌 조회
}



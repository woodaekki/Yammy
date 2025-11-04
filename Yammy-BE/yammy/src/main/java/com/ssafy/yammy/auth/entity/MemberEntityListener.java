package com.ssafy.yammy.auth.entity;

import com.ssafy.yammy.payment.entity.Point;
import com.ssafy.yammy.payment.repository.PointRepository;
import jakarta.persistence.PostPersist;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class MemberEntityListener {

    private static PointRepository pointRepository;

    /**
     * Spring Bean으로 등록된 PointRepository를 정적 필드에 주입
     * EntityListener는 JPA에 의해 관리되므로 static 필드를 사용해야 합니다.
     */
    @Autowired
    public void init(PointRepository pointRepository) {
        MemberEntityListener.pointRepository = pointRepository;
    }

    @PostPersist
    public void createPointAccount(Member member) {
        Point point = new Point();
        point.setMember(member);
        point.setBalance(0L);
        point.setUpdatedAt(LocalDateTime.now());
        pointRepository.save(point);
    }
}

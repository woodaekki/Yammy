package com.ssafy.yammy.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ssafy.yammy.payment.entity.Point;

public interface PointRepository extends JpaRepository<Point,Long> {
}



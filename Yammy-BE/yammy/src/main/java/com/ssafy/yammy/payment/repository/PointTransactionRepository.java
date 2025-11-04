package com.ssafy.yammy.payment.repository;

import com.ssafy.yammy.payment.entity.PointTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, Integer> {
}

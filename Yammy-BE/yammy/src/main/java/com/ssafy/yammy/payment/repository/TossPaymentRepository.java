package com.ssafy.yammy.payment.repository;

import com.ssafy.yammy.payment.entity.TossPayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TossPaymentRepository extends JpaRepository<TossPayment, Long> {
    TossPayment findByPaymentKey(String paymentKey);
}

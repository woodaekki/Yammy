package com.ssafy.yammy.payment.repository;

import com.ssafy.yammy.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TossPaymentRepository extends JpaRepository<Payment, String> {
}

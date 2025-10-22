package com.ssafy.yammy.payment.repository;
import com.ssafy.yammy.payment.entity.UsedItem;
import org.springframework.data.jpa.repository.JpaRepository;

// DB 조회 기능 제공
public interface UsedItemRepository extends JpaRepository<UsedItem, Long> {
}

package com.ssafy.yammy.payment.repository;

import com.ssafy.yammy.payment.entity.Team;
import com.ssafy.yammy.payment.entity.UsedItem;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UsedItemRepository extends JpaRepository<UsedItem, Long> {

    // 팀 + 키워드 검색
    @Query("""
        SELECT u 
        FROM UsedItem u
        WHERE (:team IS NULL OR u.team = :team)
          AND (:keyword IS NULL 
               OR LOWER(u.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY u.createdAt DESC
    """)
    List<UsedItem> searchUsedItems(@Param("keyword") String keyword,
                                   @Param("team") Team team);
}

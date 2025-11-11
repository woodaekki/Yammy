package com.ssafy.yammy.match.repository;

import com.ssafy.yammy.match.entity.MatchResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MatchResultRepository extends JpaRepository<MatchResult, String> {
    
    // matchcode로 조회
    Optional<MatchResult> findByMatchcode(String matchcode);
    
    // matchcode 존재 여부 확인
    boolean existsByMatchcode(String matchcode);
}

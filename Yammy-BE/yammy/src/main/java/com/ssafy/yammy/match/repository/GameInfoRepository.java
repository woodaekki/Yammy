package com.ssafy.yammy.match.repository;

import com.ssafy.yammy.match.entity.GameInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameInfoRepository extends JpaRepository<GameInfo, Long> {

    Optional<GameInfo> findByMatchcode(String matchcode);
}

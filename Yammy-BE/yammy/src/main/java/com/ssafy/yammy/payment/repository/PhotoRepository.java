package com.ssafy.yammy.payment.repository;

import com.ssafy.yammy.payment.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByTemporaryTrueAndCreatedAtBefore(LocalDateTime threshold);
}


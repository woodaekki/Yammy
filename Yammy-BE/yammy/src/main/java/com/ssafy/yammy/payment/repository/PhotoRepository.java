package com.ssafy.yammy.payment.repository;

import com.ssafy.yammy.payment.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
}

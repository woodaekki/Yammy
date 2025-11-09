package com.ssafy.yammy.escrow.repository;

import com.ssafy.yammy.escrow.entity.Escrow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EscrowRepository extends JpaRepository<Escrow,Long> {

}

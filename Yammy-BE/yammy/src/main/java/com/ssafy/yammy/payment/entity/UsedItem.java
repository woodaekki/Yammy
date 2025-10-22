package com.ssafy.yammy.payment.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDateTime;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class) // 
public class UsedItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String title;
    public String description;
    public Integer price;
    public boolean status;

    @CreatedDate
    @Column(updatable = false) // db에 저장 이후 수정될 수 없도록
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

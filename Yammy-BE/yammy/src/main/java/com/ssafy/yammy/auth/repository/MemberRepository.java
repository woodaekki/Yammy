package com.ssafy.yammy.auth.repository;

import com.ssafy.yammy.auth.entity.Member;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    // 로그인 ID로 조회 (주의: PK가 아닌 일반 필드 'id'로 조회)
    @Query("SELECT m FROM Member m WHERE m.id = :loginId")
    Optional<Member> findById(@Param("loginId") String loginId);

    // 이메일로 조회
    Optional<Member> findByEmail(String email);

    // 닉네임으로 조회
    Optional<Member> findByNickname(String nickname);

    // 로그인 ID 중복 확인
    @Query("SELECT COUNT(m) > 0 FROM Member m WHERE m.id = :loginId")
    boolean existsById(@Param("loginId") String loginId);

    // 이메일 중복 확인
    boolean existsByEmail(String email);

    // 닉네임 중복 확인
    boolean existsByNickname(String nickname);

    // 카카오 ID로 조회
    Optional<Member> findByKakaoId(String kakaoId);

    // 카카오 ID로 삭제
    void deleteByKakaoId(String kakaoId);
}

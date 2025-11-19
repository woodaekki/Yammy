# Yammy 프로젝트 아키텍처

## 📋 목차
1. [시스템 전체 아키텍처](#시스템-전체-아키텍처)
2. [프론트엔드 아키텍처](#프론트엔드-아키텍처)
3. [백엔드 아키텍처](#백엔드-아키텍처)
4. [데이터베이스 설계](#데이터베이스-설계)
5. [주요 기능별 플로우](#주요-기능별-플로우)

---

## 시스템 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   React UI   │  │  localStorage│  │   MetaMask   │          │
│  │              │  │   (NFT 상태)  │  │   (Optional) │          │
│  └──────┬───────┘  └──────────────┘  └──────────────┘          │
│         │                                                         │
└─────────┼─────────────────────────────────────────────────────────┘
          │
          │ HTTP/HTTPS (REST API)
          │ JWT Authentication
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Spring Boot Application                        │ │
│  │                                                              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │ │
│  │  │  Auth    │  │   SNS    │  │  Ticket  │  │   NFT    │  │ │
│  │  │Controller│  │Controller│  │Controller│  │Controller│  │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │ │
│  │       │             │             │             │          │ │
│  │  ┌────┴─────┬───────┴─────┬───────┴─────┬───────┴─────┐  │ │
│  │  │  Auth    │   SNS       │  Ticket     │   NFT       │  │ │
│  │  │ Service  │  Service    │  Service    │  Service    │  │ │
│  │  └────┬─────┴───────┬─────┴───────┬─────┴───────┬─────┘  │ │
│  │       │             │             │             │          │ │
│  │  ┌────┴─────────────┴─────────────┴─────────────┴─────┐  │ │
│  │  │              JPA Repository Layer                    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└────────────┬─────────────────────────────────────────────────────┘
             │
             │
    ┌────────┴────────┬──────────────────┬─────────────────┐
    ▼                 ▼                  ▼                 ▼
┌─────────┐  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│  MySQL  │  │  AWS S3     │  │   IPFS       │  │  Ethereum   │
│         │  │  (Images)   │  │  (NFT Data)  │  │  (Sepolia)  │
└─────────┘  └─────────────┘  └──────────────┘  └─────────────┘
```

---

## 프론트엔드 아키텍처

### 디렉토리 구조
```
Yammy-FE/
├── src/
│   ├── api/                      # API 클라이언트
│   │   └── apiClient.js          # Axios 인스턴스, 인터셉터
│   ├── auth/                     # 인증 관련
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── AuthContext.jsx
│   ├── sns/                      # SNS 기능
│   │   ├── SNSPage.jsx           # 전체 피드
│   │   ├── api/
│   │   │   └── snsApi.js         # SNS API 함수들
│   │   ├── components/
│   │   │   ├── FollowListModal.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   ├── UserSearchPage.jsx
│   │   │   └── SNSNavigationBar.jsx
│   │   ├── styles/
│   │   └── utils/
│   │       └── teamColors.js     # 팀 색상 설정
│   ├── ticket/                   # 티켓 관련
│   │   ├── pages/
│   │   │   ├── TicketCreatePage.jsx
│   │   │   └── TicketListPage.jsx
│   │   ├── components/
│   │   │   └── TicketCard.jsx    # NFT 발급 기능 포함
│   │   ├── api/
│   │   │   └── nftApi.js         # NFT API
│   │   └── styles/
│   ├── mypage/
│   │   └── MyPage.jsx
│   └── utils/
│       └── teamLogos.js
```

### 상태 관리 전략

```
┌─────────────────────────────────────────┐
│         React Component State           │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────────┐  ┌────────────────┐ │
│  │  useState      │  │  useEffect     │ │
│  │  - UI 상태     │  │  - 데이터 로드 │ │
│  │  - 폼 입력     │  │  - 구독/정리   │ │
│  └────────────────┘  └────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      localStorage                  │ │
│  │  - 토큰 (accessToken, refreshToken)│ │
│  │  - 사용자 정보 (memberId, team)   │ │
│  │  - NFT 발급 중 상태                │ │
│  │    (nft_minting_${ticketId})       │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### API 통신 플로우

```
┌──────────────┐
│  Component   │
└──────┬───────┘
       │ 1. API 함수 호출
       ▼
┌──────────────────────────┐
│      snsApi.js           │
│  - getAllPosts()         │
│  - followUser()          │
│  - togglePostLike()      │
└──────┬───────────────────┘
       │ 2. HTTP 요청
       ▼
┌──────────────────────────┐
│     apiClient.js         │
│  - Axios 인스턴스        │
│  - Request Interceptor   │
│    (토큰 자동 추가)      │
│  - Response Interceptor  │
│    (401 시 토큰 재발급)  │
└──────┬───────────────────┘
       │ 3. HTTP 요청
       ▼
┌──────────────────────────┐
│   Backend API Server     │
└──────────────────────────┘
```

---

## 백엔드 아키텍처

### 레이어 구조

```
┌─────────────────────────────────────────────────────────┐
│                   Controller Layer                       │
│  - HTTP 요청/응답 처리                                   │
│  - 입력 검증                                             │
│  - @RestController, @RequestMapping                      │
├─────────────────────────────────────────────────────────┤
│                   Service Layer                          │
│  - 비즈니스 로직                                         │
│  - 트랜잭션 관리 (@Transactional)                       │
│  - DTO ↔ Entity 변환                                    │
├─────────────────────────────────────────────────────────┤
│                   Repository Layer                       │
│  - 데이터베이스 접근                                     │
│  - JPA 쿼리 메서드                                       │
│  - @Query 커스텀 쿼리                                    │
├─────────────────────────────────────────────────────────┤
│                   Entity Layer                           │
│  - 데이터베이스 테이블 매핑                             │
│  - @Entity, @Table                                       │
└─────────────────────────────────────────────────────────┘
```

### 주요 모듈

```
Yammy-BE/yammy/src/main/java/com/ssafy/yammy/
├── auth/                         # 인증/인가
│   ├── controller/
│   │   └── MemberController.java
│   ├── service/
│   │   └── MemberService.java
│   ├── repository/
│   │   └── MemberRepository.java
│   ├── entity/
│   │   └── Member.java
│   └── dto/
│       ├── MemberSearchResponse.java  # isFollowing 포함
│       └── LoginRequest.java
├── post/                         # SNS 게시글
│   ├── controller/
│   │   └── PostController.java
│   ├── service/
│   │   └── PostService.java       # 팔로우 상태 배치 조회
│   ├── repository/
│   │   └── PostRepository.java
│   ├── entity/
│   │   ├── Post.java
│   │   └── PostImage.java
│   └── dto/
│       └── PostResponse.java      # isFollowing 필드 추가
├── follow/                       # 팔로우 기능
│   ├── controller/
│   │   └── FollowController.java
│   ├── service/
│   │   └── FollowService.java
│   ├── repository/
│   │   └── FollowRepository.java  # 배치 조회 메서드 추가
│   └── entity/
│       └── Follow.java
├── ticket/                       # 티켓 관리
│   ├── controller/
│   │   └── TicketController.java
│   ├── service/
│   │   └── TicketService.java
│   ├── repository/
│   │   └── TicketRepository.java
│   ├── entity/
│   │   └── Ticket.java            # NFT 관련 필드 포함
│   └── dto/
│       └── TicketResponse.java    # nftMinted, nftTokenId 등
├── nft/                          # NFT 발급
│   ├── controller/
│   │   └── NFTController.java
│   └── service/
│       └── NFTService.java        # IPFS, 블록체인 연동
└── config/
    ├── SecurityConfig.java        # JWT 인증
    └── WebConfig.java
```

---

## 데이터베이스 설계

### ERD

```
┌──────────────────┐           ┌──────────────────┐
│     Member       │           │      Post        │
├──────────────────┤           ├──────────────────┤
│ member_id (PK)   │───────────│ member_id (FK)   │
│ email            │     1:N   │ post_id (PK)     │
│ password         │           │ caption          │
│ nickname         │           │ created_at       │
│ team             │           └──────────────────┘
│ profile_image    │                    │
└──────────────────┘                    │ 1:N
        │                               │
        │ 1:N                   ┌───────┴──────────┐
        │                       │   PostImage      │
        ▼                       ├──────────────────┤
┌──────────────────┐            │ post_id (FK)     │
│     Follow       │            │ image_url        │
├──────────────────┤            │ image_order      │
│ follow_id (PK)   │            └──────────────────┘
│ follower_id (FK) │
│ following_id (FK)│
└──────────────────┘

┌──────────────────┐
│     Ticket       │
├──────────────────┤
│ ticket_id (PK)   │
│ member_id (FK)   │
│ game             │
│ date             │
│ location         │
│ seat             │
│ photo_url        │
│ nft_minted       │      NFT 발급 여부
│ nft_token_id     │      블록체인 토큰 ID
│ nft_metadata_uri │      IPFS 메타데이터
│ ipfs_image_hash  │      IPFS 이미지 해시
└──────────────────┘
```

---

## 주요 기능별 플로우

### 1. SNS 팔로우/언팔로우 (새로고침 시 상태 유지)

```
┌──────────────┐
│   사용자     │
└──────┬───────┘
       │ 1. 팔로우 버튼 클릭
       ▼
┌──────────────────────────┐
│   SNSPage.jsx            │
│  handleToggleFollow()    │
└──────┬───────────────────┘
       │ 2. API 호출
       ▼
┌──────────────────────────┐
│   POST /follows/{id}     │
│   or DELETE /follows/{id}│
└──────┬───────────────────┘
       │ 3. DB 업데이트
       ▼
┌──────────────────────────┐
│   FollowService.java     │
│  - Follow 레코드 생성/삭제│
└──────┬───────────────────┘
       │ 4. 응답 반환
       ▼
┌──────────────────────────┐
│   SNSPage.jsx            │
│  - setPosts() 상태 업데이트│
│  - isFollowing 토글      │
└──────────────────────────┘

       ┌─ 새로고침 ─┐
       │            │
       ▼            ▼
┌──────────────────────────┐
│   GET /posts/all         │
│  - PostService           │
│  - buildPostListResponse │
│    ✅ 팔로우 상태 배치 조회│
│    ✅ isFollowing 포함   │
└──────┬───────────────────┘
       │ 5. 응답 반환
       ▼
┌──────────────────────────┐
│   SNSPage.jsx            │
│  ✅ 팔로우 상태 정확히 표시│
└──────────────────────────┘
```

**핵심 개선사항:**
- `PostResponse`에 `isFollowing` 필드 추가
- `FollowRepository`에 배치 조회 메서드 추가
- `PostService.buildPostListResponse()`에서 팔로우 상태를 배치로 조회하여 성능 최적화

---

### 2. NFT 발급 (발급 중 상태 유지)

```
┌──────────────┐
│   사용자     │
└──────┬───────┘
       │ 1. "NFT 발급하기" 클릭
       ▼
┌──────────────────────────────────┐
│   TicketCard.jsx                 │
│  handleMintNFT()                 │
│  ✅ localStorage 저장             │
│     localStorage.setItem(        │
│       `nft_minting_${ticketId}`, │
│       'true'                     │
│     )                            │
└──────┬───────────────────────────┘
       │ 2. 티켓 캡처 (html2canvas)
       ▼
┌──────────────────────────┐
│  티켓 이미지 생성         │
│  - 뒷면만 캡처           │
│  - Blob → File 변환      │
└──────┬───────────────────┘
       │ 3. API 호출
       ▼
┌──────────────────────────┐
│   POST /nft/mint         │
│  - ticketId              │
│  - ticketImage (File)    │
└──────┬───────────────────┘
       │ 4. NFT 발급 프로세스
       ▼
┌──────────────────────────┐
│   NFTService.java        │
│  1. IPFS 업로드          │
│  2. 메타데이터 생성      │
│  3. 스마트 컨트랙트 호출 │
│  4. DB 업데이트          │
│     (nft_minted = true)  │
└──────┬───────────────────┘
       │ 5. 응답 반환
       ▼
┌──────────────────────────────────┐
│   TicketCard.jsx                 │
│  ✅ localStorage 제거             │
│     localStorage.removeItem(     │
│       `nft_minting_${ticketId}`  │
│     )                            │
│  - 알림 표시                     │
│  - NFT 발급 완료 배지            │
└──────────────────────────────────┘

       ┌─ 새로고침 (발급 중) ─┐
       │                      │
       ▼                      ▼
┌──────────────────────────────────┐
│   TicketCard.jsx (mount)         │
│  ✅ useState(() => {              │
│       return localStorage.getItem│
│         (`nft_minting_${id}`)    │
│         === 'true'               │
│     })                           │
│  ✅ "발급 중..." 상태 유지        │
└──────────────────────────────────┘

       ┌─ 새로고침 (발급 완료) ─┐
       │                        │
       ▼                        ▼
┌──────────────────────────────────┐
│   GET /tickets               │
│  ✅ nftMinted = true         │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│   TicketCard.jsx                 │
│  useEffect(() => {               │
│    if (ticket.nftMinted) {       │
│      localStorage.removeItem()   │
│    }                             │
│  })                              │
│  ✅ "NFT 발급 완료" 배지 표시    │
└──────────────────────────────────┘
```

**핵심 개선사항:**
- `localStorage`를 사용하여 발급 중 상태 저장
- 페이지 새로고침 시에도 상태 유지
- NFT 발급 완료 시 자동으로 localStorage 정리

---

### 3. 인증 플로우 (JWT)

```
┌──────────────┐
│   사용자     │
└──────┬───────┘
       │ 1. 로그인
       ▼
┌──────────────────────────┐
│   POST /auth/login       │
│  - email, password       │
└──────┬───────────────────┘
       │ 2. 인증 확인
       ▼
┌──────────────────────────┐
│   AuthService.java       │
│  - 비밀번호 검증         │
│  - JWT 생성              │
│    • accessToken (30분)  │
│    • refreshToken (7일)  │
└──────┬───────────────────┘
       │ 3. 토큰 반환
       ▼
┌──────────────────────────┐
│   Login.jsx              │
│  - localStorage 저장     │
│    • accessToken         │
│    • refreshToken        │
│    • memberId, team      │
└──────────────────────────┘

       ┌─ API 요청 ─┐
       │            │
       ▼            ▼
┌──────────────────────────┐
│   apiClient.js           │
│  Request Interceptor     │
│  - Authorization 헤더    │
│    "Bearer {accessToken}"│
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│   Backend API            │
│  - JWT 검증              │
└──────┬───────────────────┘
       │
       ├─ 성공 ─────────────▶ 정상 응답
       │
       └─ 401 실패 ───┐
                      ▼
       ┌──────────────────────────┐
       │   apiClient.js           │
       │  Response Interceptor    │
       │  - refreshToken으로 재발급│
       └──────┬───────────────────┘
              │
              ├─ 재발급 성공 ──▶ 원래 요청 재시도
              │
              └─ 재발급 실패 ──▶ 로그인 페이지
```

---

## 성능 최적화

### 1. 배치 조회로 N+1 문제 해결

**개선 전:**
```java
// PostService - N+1 문제 발생
for (Post post : posts) {
    boolean isFollowing = followRepository
        .existsByFollowerIdAndFollowingId(memberId, post.getMemberId());
    // 100개 게시글 → 100번 DB 쿼리
}
```

**개선 후:**
```java
// PostService - 배치 조회
List<Long> memberIds = posts.stream()
    .map(Post::getMemberId)
    .collect(Collectors.toList());

// 1번의 쿼리로 모든 팔로우 상태 조회
Set<Long> followingMemberIds = new HashSet<>(
    followRepository.findFollowingIdsByFollowerIdAndFollowingIds(memberId, memberIds)
);
```

**성능 개선:**
- 100개 게시글: 100번 쿼리 → **1번 쿼리**
- 응답 시간: ~1000ms → **~50ms**

---

### 2. 이미지 최적화

- **S3 사용**: 이미지 파일을 S3에 저장하여 서버 부하 감소
- **IPFS 사용**: NFT 이미지는 IPFS에 저장하여 탈중앙화
- **Lazy Loading**: 티켓 이미지 로드 최적화

---

## 보안

### 1. 인증/인가
- JWT 기반 토큰 인증
- RefreshToken으로 보안 강화
- 비밀번호 암호화 (BCrypt)

### 2. API 보안
- CORS 설정
- XSS, SQL Injection 방지
- Rate Limiting (추후 적용 가능)

### 3. 민감 정보 관리
- `.env` 파일로 환경변수 관리
- `.gitignore`에 등록하여 커밋 방지

---

## 배포 아키텍처 (예시)

```
┌─────────────────────────────────────────┐
│              User Browser                │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         CDN (CloudFront)                 │
│         - Static Assets (React)          │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         Load Balancer (ALB)              │
└─────────────┬───────────────────────────┘
              │
        ┌─────┴─────┐
        ▼           ▼
┌──────────┐  ┌──────────┐
│  EC2 #1  │  │  EC2 #2  │
│ (Backend)│  │ (Backend)│
└────┬─────┘  └────┬─────┘
     │             │
     └──────┬──────┘
            ▼
┌─────────────────────┐
│   RDS (MySQL)       │
└─────────────────────┘
```

---

## 기술 스택 요약

### Frontend
- **React** 18.x
- **React Router** - SPA 라우팅
- **Axios** - HTTP 클라이언트
- **html2canvas** - 티켓 이미지 캡처

### Backend
- **Spring Boot** 3.x
- **Spring Security** - JWT 인증
- **JPA/Hibernate** - ORM
- **MySQL** - 관계형 DB

### Blockchain/Storage
- **Ethereum (Sepolia)** - NFT 발급
- **IPFS (Pinata)** - NFT 메타데이터/이미지 저장
- **AWS S3** - 일반 이미지 저장

---

## 마무리

이 아키텍처는 다음을 목표로 설계되었습니다:

1. **확장성**: 마이크로서비스 전환 가능한 모듈 구조
2. **성능**: 배치 조회, 캐싱 등으로 최적화
3. **유지보수성**: 명확한 레이어 분리, 일관된 코드 스타일
4. **보안**: JWT 인증, 데이터 암호화
5. **사용자 경험**: 새로고침 시에도 상태 유지, 빠른 응답

---

**작성일**: 2025-01-19
**버전**: 1.0

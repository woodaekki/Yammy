# Yammy (야미: 야구에 미치다)

> SSAFY 13기 C205팀 자율 프로젝트 - 야구 팬을 위한 종합 커뮤니티 플랫폼

## 목차
- [프로젝트 소개](#프로젝트-소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [주요 화면](#주요-화면)


## 프로젝트 소개

**Yammy**는 야구를 사랑하는 팬들을 위한 올인원 플랫폼입니다.
경기 정보 제공부터 AI 기반 승부 예측, 실시간 응원 채팅, 중고 굿즈 거래, NFT 티켓까지 야구 팬들이 필요로 하는 모든 것을 한 곳에서 제공합니다.

### 개발 기간
2025년 10월 ~ 2025년 11월 (6주)

## 주요 기능

### 1. SNS (소셜 네트워크)
- 야구 팬들을 위한 전용 소셜 미디어
- 게시글 작성/수정/삭제 및 이미지 업로드
- 댓글 및 좋아요 기능
- 팔로우/팔로잉 시스템
- 사용자 프로필 및 검색

### 2. 경기 정보 및 AI 예측
- KBO 경기 일정 및 실시간 결과 조회
- **AI 야미픽**: GPT-4 기반 경기 승부 예측
- 포인트를 활용한 베팅 시스템
- 경기별 상세 통계 제공

### 3. 실시간 응원 채팅
- Firebase 기반 실시간 채팅
- 팀별 응원 채팅방
- Kafka를 활용한 안정적인 메시지 처리

### 4. 중고 거래
- 야구 관련 굿즈 중고거래 플랫폼
- **에스크로 시스템**으로 안전거래 보장
- 실시간 채팅으로 거래 협상
- AWS S3를 통한 이미지 업로드

### 5. 포인트 & 결제 시스템
- **토스페이먼츠** 연동 안전결제
- 포인트 충전/사용 관리
- 출금 기능 지원
- 상세한 거래 내역 제공

### 6. NFT 티켓
- 야구 경기 티켓 NFT 발행
- Ethereum Sepolia 네트워크 기반
- IPFS(Pinata)를 통한 메타데이터 저장
- html2canvas로 티켓 이미지 생성

## 기술 스택

### Frontend
| Category | Technology |
|----------|------------|
| Main Library | React 19.1.1 |
| Build Tool | Vite 7.1.7 |
| State Management | Zustand 5.0.8 |
| CSS Framework | Tailwind CSS 4.1.15 |
| Routing | React Router DOM 7.9.4 |
| HTTP Client | Axios 1.13.0 |
| Realtime | Firebase 12.4.0 |
| Payment | TossPayments SDK 2.4.0 |
| Language | JavaScript (ES6+) |

### Backend
| Category | Technology |
|----------|------------|
| Framework | Spring Boot 3.5.6 |
| Language | Java 17 |
| ORM | JPA/Hibernate, QueryDSL 5.0.0 |
| Security | Spring Security + JWT |
| Database | MySQL 8.0, Redis |
| Message Queue | Apache Kafka |
| Cloud Storage | AWS S3 |
| Blockchain | Web3j 4.10.3 |
| AI | OpenAI GPT-4 API |
| Payment | 토스페이먼츠 API |
| Email | Spring Mail (Gmail SMTP) |

### AI/Data
| Category | Technology |
|----------|------------|
| Framework | FastAPI 0.119.1 |
| Language | Python 3.x |
| Data Collection | kbodata 2.2.3, Selenium 4.0.0 |
| Data Processing | Pandas 2.3.3 |
| Database | MySQL Connector 9.5.0 |

### Infrastructure & DevOps
| Category | Technology |
|----------|------------|
| Deployment | AWS EC2 |
| Container | Docker, Docker Compose |
| CI/CD | GitLab CI/CD |
| Container Registry | AWS ECR |
| Web Server | Nginx |

### External Services
- **Firebase**: 실시간 채팅
- **AWS S3**: 이미지 스토리지
- **Ethereum Sepolia**: NFT 네트워크
- **IPFS (Pinata)**: NFT 메타데이터 저장
- **TossPayments**: 결제 게이트웨이
- **Kakao**: OAuth 소셜 로그인
- **OpenAI**: GPT-4 API

## 프로젝트 구조

```
S13P31C205/
├── Yammy-FE/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/            # API 클라이언트 설정
│   │   ├── auth/           # 인증 (로그인/회원가입)
│   │   ├── chatgames/      # 응원 채팅방
│   │   ├── match/          # 경기 정보
│   │   ├── mypage/         # 마이페이지
│   │   ├── payment/        # 결제 및 포인트
│   │   ├── predict/        # AI 예측 및 베팅
│   │   ├── router/         # 라우팅 설정
│   │   ├── shared/         # 공통 컴포넌트
│   │   ├── sns/            # 소셜 네트워크
│   │   ├── stores/         # 전역 상태 관리 (Zustand)
│   │   ├── ticket/         # NFT 티켓
│   │   ├── useditem/       # 중고거래
│   │   ├── useditemchat/   # 중고거래 채팅
│   │   ├── withdrawal/     # 출금
│   │   └── utils/          # 유틸리티
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
├── Yammy-BE/               # Backend (Spring Boot)
│   └── yammy/
│       ├── src/main/
│       │   ├── java/com/ssafy/yammy/
│       │   │   ├── auth/           # 인증/회원
│       │   │   ├── chatgames/      # 채팅방
│       │   │   ├── comment/        # 댓글
│       │   │   ├── config/         # 설정 (Security, Redis, Kafka, S3)
│       │   │   ├── escrow/         # 에스크로
│       │   │   ├── follow/         # 팔로우
│       │   │   ├── kafka/          # Kafka Producer/Consumer
│       │   │   ├── match/          # 경기 정보
│       │   │   ├── nft/            # NFT 발행
│       │   │   ├── payment/        # 결제/포인트
│       │   │   ├── post/           # 게시글
│       │   │   ├── predict/        # 예측/베팅
│       │   │   ├── ticket/         # 티켓 관리
│       │   │   ├── useditemchat/   # 중고거래 채팅
│       │   │   └── withdrawal/     # 출금
│       │   └── resources/
│       │       └── application.yml
│       ├── Dockerfile
│       └── build.gradle
│
└── Yammy-AI/               # AI Server (FastAPI)
    ├── app.py              # FastAPI 앱
    ├── config.py           # MySQL 설정
    ├── controller/
    │   └── baseballdata.py # KBO 데이터 수집
    └── requirements.txt
```

## 시작하기

### Frontend

#### 1. 의존성 설치
```bash
cd Yammy-FE
npm install
```

#### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 입력하세요:
```env
VITE_API_BASE_URL=http://localhost:8080/api

# Firebase 설정
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### 3. 개발 서버 실행
```bash
npm run dev
```
개발 서버가 `http://localhost:5173`에서 실행됩니다.

#### 4. 프로덕션 빌드
```bash
npm run build
```

#### 5. 프로덕션 미리보기
```bash
npm run preview
```

### Backend

#### 1. 의존성 설치 및 빌드
```bash
cd Yammy-BE/yammy
./gradlew build
```

#### 2. 환경 변수 설정
`application.yml`에서 다음 항목들을 설정하세요:
- MySQL 연결 정보
- Redis 연결 정보
- Kafka 설정
- AWS S3 설정
- Firebase 서비스 키
- JWT Secret Key
- TossPayments API Key
- Ethereum 네트워크 설정
- OpenAI API Key

#### 3. 애플리케이션 실행
```bash
./gradlew bootRun
```
서버가 `http://localhost:8080`에서 실행됩니다.

### AI Server

#### 1. 의존성 설치
```bash
cd Yammy-AI
pip install -r requirements.txt
```

#### 2. 환경 변수 설정
`config.py`에서 MySQL 연결 정보를 설정하세요.

#### 3. 서버 실행
```bash
python main.py
```
FastAPI 서버가 `http://localhost:8000`에서 실행됩니다.

## Available Scripts (Frontend)

- `npm run dev` - 개발 서버 시작 (Vite)
- `npm run build` - 프로덕션 빌드
- `npm run preview` - 프로덕션 빌드 미리보기
- `npm run lint` - ESLint 실행

## 주요 화면

### 인증
- 로그인 / 회원가입
- 이메일 인증
- 카카오 소셜 로그인
- 비밀번호 변경

### SNS
- 피드 (게시글 목록)
- 게시글 작성/수정/삭제
- 댓글 및 좋아요
- 사용자 프로필
- 팔로우 관리

### 경기 정보
- 경기 일정 조회
- 경기 결과 상세보기
- 날짜별 검색

### AI 예측 & 베팅
- AI 야미픽 확인
- 포인트로 베팅
- 베팅 결과 정산

### 채팅
- 팀별 응원 채팅방
- 실시간 메시지
- 관리자 채팅방 관리

### 중고거래
- 물품 등록/수정/삭제
- 물품 상세보기
- 거래 채팅
- 에스크로 시스템

### 결제 & 포인트
- 포인트 충전 (토스페이먼츠)
- 포인트 사용 내역
- 출금 요청
- 거래 내역 조회

### NFT 티켓
- NFT 티켓 목록
- 티켓 발행 (민팅)
- 티켓 이미지 생성

## API 문서

백엔드 API 문서는 Swagger UI를 통해 확인할 수 있습니다:
```
http://localhost:8080/swagger-ui.html
```

## 주요 기술적 특징

### Frontend
- **Zustand**: 경량 전역 상태 관리, LocalStorage persist
- **Axios Interceptor**: JWT 토큰 자동 갱신 및 401 에러 처리
- **Protected Routes**: 인증 기반 라우팅 보호
- **Tailwind CSS**: 유틸리티 기반 반응형 디자인
- **Firebase Realtime DB**: 실시간 채팅 구현
- **html2canvas**: NFT 티켓 이미지 생성
- **browser-image-compression**: 이미지 최적화

### Backend
- **JWT 인증**: Access Token (15분) + Refresh Token (14일)
- **Spring Security**: 권한 기반 접근 제어
- **JPA + QueryDSL**: 복잡한 쿼리 처리
- **Redis**: RefreshToken 저장, 이메일 인증 코드 관리
- **Kafka**: 메시지 큐를 통한 안정적인 채팅
- **AWS S3**: 이미지 저장소
- **Web3j**: Ethereum 블록체인 연동
- **Escrow System**: 안전거래 보장
- **TossPayments SDK**: 안전한 결제 처리
- **OpenAI API**: GPT-4 기반 경기 예측

### AI/Data
- **kbodata**: KBO 공식 데이터 수집
- **Selenium**: 웹 스크래핑
- **FastAPI**: 고성능 비동기 API
- **Pandas**: 데이터 처리 및 변환

### DevOps
- **Docker**: 컨테이너화
- **GitLab CI/CD**: 자동 빌드/배포
- **AWS ECR**: Docker 이미지 레지스트리
- **Nginx**: 리버스 프록시 및 정적 파일 서빙

## 아키텍처 특징

- **마이크로서비스 지향**: Frontend, Backend, AI 서버 분리
- **실시간 통신**: Firebase Realtime DB, Kafka 활용
- **확장 가능**: Docker 컨테이너화, CI/CD 자동화
- **보안**: JWT, Spring Security, 에스크로 시스템
- **결제 안정성**: 토스페이먼츠 공식 SDK
- **블록체인**: Ethereum 기반 NFT 티켓

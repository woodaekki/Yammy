# --- Frontend Dockerfile (Yammy_FE/Dockerfile) ---

# 1. 빌드 스테이지: Node.js 환경에서 프론트엔드 프로젝트 빌드
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 설치 및 빌드 과정 (이전과 동일)
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
# 이 명령의 결과물이 보통 /app/build 또는 /app/dist 에 생성된다고 가정합니다.

# 2. 서빙 스테이지: JRE 대신 Node.js 런타임을 사용하며, 'serve' 패키지를 설치
FROM node:20-alpine AS runner

# 'serve' 패키지를 전역으로 설치합니다.
RUN npm install -g serve

# ⭐️ 빌드된 정적 파일만 런타임 이미지로 복사 ⭐️
# /app/build 경로는 실제 프론트엔드 빌드 결과물 경로에 맞춰 수정해야 합니다.
COPY --from=builder /app/dist /usr/app/www

# 애플리케이션 포트 오픈
EXPOSE 3000

# 'serve' 명령으로 정적 파일을 서빙합니다.
# -s 플래그는 SPA(Single Page Application) 라우팅을 위해 필수입니다.
# -l 3000은 3000번 포트로 리스닝합니다.
CMD ["serve", "-s", "/usr/app/www", "-l", "3000"]
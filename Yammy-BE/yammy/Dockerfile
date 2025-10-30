# --- Backend Dockerfile (Yammy_BE/yammy/Dockerfile) ---

# JRE (Runtime Environment) Alpine 버전을 사용 (가장 가볍고 보안에 좋음)
FROM eclipse-temurin:17-jre-alpine

# 이미지 내에서 애플리케이션이 실행될 디렉토리 설정
WORKDIR /app

# ⭐️ 1. JAR 파일 복사: Test_Build_BE에서 artifacts로 가져온 파일을 복사 ⭐️
# artifacts는 Dockerfile이 있는 디렉토리(Yammy-BE/yammy) 기준 build/libs/ 경로에 복사됩니다.
COPY build/libs/*.jar /app/project.jar

# ⭐️ 2. 운영 설정 파일 복사 ⭐️
# BE_Image 잡의 스크립트에서 생성한 application-prod.yml 파일을 이미지 내부에 복사
# 이 파일은 src/main/resources에 생성되었으므로 해당 경로를 따라 복사합니다.
COPY src/main/resources/application-prod.yml /app/application-prod.yml

# 포트 노출 (Spring Boot 기본 포트)
EXPOSE 8080

# 환경 변수 설정 (운영 프로파일 활성화)
ENV SPRING_PROFILES_ACTIVE prod

# 애플리케이션 실행 명령어
ENTRYPOINT ["java", "-jar", "/app/project.jar"]
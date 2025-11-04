FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY build/libs/yammy-0.0.1-SNAPSHOT.jar /app/project.jar

COPY src/main/resources/application.yml /app/application.yml

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE prod

ENTRYPOINT ["java", "-jar", "/app/project.jar"]
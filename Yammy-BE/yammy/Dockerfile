FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY build/libs/yammy-0.0.1-SNAPSHOT.jar /app/project.jar

COPY src/main/resources/application.yml /app/application.yml

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE prod

ENV JAVA_TOOL_OPTIONS="-Dio.netty.handler.ssl.noOpenSsl=true -Djavax.net.debug=none"

ENTRYPOINT ["java", "-jar", "/app/project.jar"]

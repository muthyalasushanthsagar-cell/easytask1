# ---------- Build stage ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B clean package -DskipTests

# ---------- Run stage ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/easy-task-backend-1.0.0.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
# Keeps memory usage inside Render's 512 MB free instance
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -Xss512k"

EXPOSE 8088
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

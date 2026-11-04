# syntax=docker/dockerfile:1
# Build:  docker build -t cute-icles-backend .
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
# Tests run in CI (.github/workflows/ci.yml); the image build only packages.
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:21-jre
RUN useradd --system --uid 1001 --create-home app \
 && mkdir -p /data/uploads && chown -R app:app /data
WORKDIR /app
COPY --from=build /app/target/*.jar /app/app.jar
USER app
ENV SPRING_PROFILES_ACTIVE=prod \
    UPLOAD_DIR=/data/uploads \
    SERVER_FORWARD_HEADERS_STRATEGY=native
# Mount a persistent disk/volume at /data/uploads or uploaded gallery images are lost on redeploy.
VOLUME ["/data/uploads"]
EXPOSE 8080
# Hosts such as Render/Railway/Fly give the port in $PORT.
ENTRYPOINT ["sh", "-c", "exec java -XX:MaxRAMPercentage=75 -Dserver.port=${PORT:-8080} -jar /app/app.jar"]

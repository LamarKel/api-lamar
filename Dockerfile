# ---- Etapa 1: compilar ----
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

# ---- Etapa 2: ejecutar ----
FROM eclipse-temurin:25-jre
# AWS Lambda Web Adapter: permite correr la API Spring Boot normal dentro de
# Lambda. Traduce los eventos de API Gateway a peticiones HTTP al puerto 8080.
# Con Docker local (docker compose) se ignora y la API funciona igual.
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

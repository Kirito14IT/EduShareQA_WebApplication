FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# 创建上传目录并赋予读写权限，以防运行时无权限
RUN mkdir -p /app/uploads && chmod 777 /app/uploads
ENTRYPOINT ["java", "-jar", "app.jar"]

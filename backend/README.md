# EduShareQA 后端服务

## 项目简介

EduShareQA 后端服务是基于 Spring Boot 3.2 开发的 RESTful API 服务，为大学在线课程答疑系统提供后端支持。

## 技术栈

- **框架**: Spring Boot 3.2
- **数据库**: MySQL 8.0
- **ORM**: MyBatis-Plus 3.5.5
- **安全**: Spring Security + JWT
- **Java版本**: JDK 17+

## 环境要求

- JDK 17 或更高版本
- Maven 3.6+
- MySQL 8.0+
- 端口 8080（可在 application.yml 中修改）

## 快速开始

### 1. 数据库配置

确保 MySQL 服务已启动，然后执行数据库初始化脚本：

```bash
# 连接到 MySQL（端口3308）
mysql -h localhost -P 3308 -u root -p123456

# 执行建表脚本
source backend/src/main/resources/db/schema.sql

# 执行初始化数据脚本
source backend/src/main/resources/db/init-data.sql
```

或者直接执行：

```bash
mysql -h localhost -P 3308 -u root -p123456 < backend/src/main/resources/db/schema.sql
mysql -h localhost -P 3308 -u root -p123456 < backend/src/main/resources/db/init-data.sql
```

### 2. 配置文件

检查 `src/main/resources/application.yml` 中的数据库配置：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3308/edushareqa?...
    username: root
    password: 123456
```

### 3. 编译和运行

```bash
# 进入后端目录
cd backend

# 编译项目
mvn clean compile

# 运行项目
mvn spring-boot:run
```

或者使用 IDE（如 IntelliJ IDEA）直接运行 `EduShareQaApplication.java`

### 4. 验证服务

服务启动后，访问：
- API 基础路径: `http://localhost:8080/api`
- 健康检查: `http://localhost:8080/api/auth/login` (POST)

## 默认账号

初始化脚本会创建默认管理员账号：
- 用户名: `admin`
- 密码: `admin123`

## API 文档

主要 API 端点：

### 认证相关
- `POST /api/auth/register` - 学生注册
- `POST /api/auth/login` - 登录

### 用户资料
- `GET /api/profile/me` - 获取当前用户信息
- `PUT /api/profile/me` - 更新用户资料
- `PUT /api/profile/password` - 修改密码

### 学生资源
- `GET /api/student/resources` - 获取资源列表
- `POST /api/student/resources` - 上传资源
- `GET /api/student/resources/{id}` - 获取资源详情
- `DELETE /api/student/resources/{id}` - 删除资源

### 学生问答
- `GET /api/student/questions` - 获取问题列表
- `POST /api/student/questions` - 创建问题
- `GET /api/student/questions/{id}` - 获取问题详情
- `DELETE /api/student/questions/{id}` - 删除问题

### 教师回答
- `POST /api/teacher/answers` - 创建回答
- `DELETE /api/teacher/answers/{id}` - 删除回答

### 通知
- `GET /api/notifications/unread-count` - 获取未读通知数

### 管理员
- `GET /api/admin/courses` - 获取课程列表
- `POST /api/admin/courses` - 创建课程
- `DELETE /api/admin/courses/{id}` - 删除课程

## 文件上传

上传的文件会保存在 `./uploads` 目录下，按类型分类：
- `./uploads/resources` - 学习资源
- `./uploads/question-attachments` - 问题附件
- `./uploads/answer-attachments` - 回答附件

文件按日期组织：`yyyy/MM/uuid.ext`

## 开发说明

### 项目结构

```
backend/
├── src/main/java/com/edushareqa/
│   ├── config/          # 配置类（Security、JWT等）
│   ├── controller/      # REST控制器
│   ├── dto/             # 数据传输对象
│   ├── entity/          # 实体类（对应数据库表）
│   ├── mapper/          # MyBatis Mapper接口
│   ├── service/         # 业务逻辑层
│   ├── security/        # 安全相关
│   ├── util/            # 工具类
│   └── exception/       # 异常处理
├── src/main/resources/
│   ├── db/              # 数据库脚本
│   └── application.yml  # 配置文件
└── pom.xml              # Maven依赖配置
```

### 响应格式

所有 API 响应遵循统一格式：

```json
{
  "code": 0,
  "message": "ok",
  "data": { ... }
}
```

- `code`: 0 表示成功，非0表示错误
- `message`: 响应消息
- `data`: 响应数据

### JWT Token

- Access Token: 15分钟有效期
- Refresh Token: 7天有效期
- 请求头格式: `Authorization: Bearer <token>`

## 常见问题

### 1. 数据库连接失败

检查：
- MySQL 服务是否启动
- 端口是否为 3308
- 数据库 `edushareqa` 是否已创建
- 用户名密码是否正确

### 2. 端口被占用

修改 `application.yml` 中的 `server.port`

### 3. 文件上传失败

检查：
- `uploads` 目录是否有写权限
- 文件大小是否超过 50MB

## 许可证

MIT License


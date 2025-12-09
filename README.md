# EduShareQA - 大学在线课程答疑系统

## 项目简介

EduShareQA 是一个为高校学生和教师提供学习资料共享与互动答疑的平台系统。系统支持学生上传学习资料、提出学习问题，教师进行答疑，管理员进行平台维护。

## 技术栈

### 前端
- React 18 + Vite + TypeScript
- Ant Design 5
- Zustand (状态管理)
- Axios (HTTP客户端)

### 后端
- Spring Boot 3.2
- MyBatis-Plus 3.5.5
- Spring Security + JWT
- MySQL 8.0

## 快速开始

### 前置要求

1. **Node.js** 18+ 和 npm
2. **JDK** 17+
3. **Maven** 3.6+
4. **MySQL** 8.0+ (端口 3308)

### 1. 数据库初始化

```bash
# 连接到 MySQL
mysql -h localhost -P 3308 -u root -p123456

# 执行建表脚本
source backend/src/main/resources/db/schema.sql

# 执行初始化数据脚本
source backend/src/main/resources/db/init-data.sql
```

### 2. 启动后端服务

```bash
cd backend

# Windows
start.bat

# Linux/Mac
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080/api` 启动

### 3. 启动前端服务

```bash
cd frontend

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

### 4. 访问系统

打开浏览器访问：`http://localhost:5173`

**默认管理员账号**：
- 用户名: `admin`
- 密码: `admin123`

## 项目结构

```
EduShareQA/
├── backend/                 # Spring Boot 后端
│   ├── src/main/java/
│   │   └── com/edushareqa/
│   │       ├── config/      # 配置类
│   │       ├── controller/  # REST API 控制器
│   │       ├── dto/         # 数据传输对象
│   │       ├── entity/      # 实体类
│   │       ├── mapper/      # MyBatis Mapper
│   │       ├── service/     # 业务逻辑层
│   │       └── security/    # 安全配置
│   ├── src/main/resources/
│   │   ├── db/              # 数据库脚本
│   │   └── application.yml  # 配置文件
│   └── pom.xml
├── frontend/                # React 前端
│   ├── src/
│   │   ├── api/             # API 调用
│   │   ├── components/      # React 组件
│   │   ├── pages/           # 页面组件
│   │   ├── store/           # 状态管理
│   │   └── types/           # TypeScript 类型
│   └── package.json
└── docs/                    # 项目文档
    ├── api-db-spec.md       # API 和数据库规范
    ├── architecture.md      # 架构设计
    └── requirements.md      # 需求文档
```

## 功能模块

### 学生功能
- ✅ 注册登录
- ✅ 浏览和搜索学习资源
- ✅ 上传学习资料
- ✅ 提问和查看回答
- ✅ 查看通知

### 教师功能
- ✅ 查看所属课程的问题
- ✅ 回答问题（支持附件）
- ✅ 上传学习资源
- ✅ 设置资源可见范围

### 管理员功能
- ✅ 课程管理
- ✅ 教师管理
- ✅ 内容审核

## API 文档

详细的 API 文档请参考：
- `docs/api-db-spec.md` - API 规范和数据库设计
- `docs/openapi.yaml` - OpenAPI 规范文件

## 开发说明

### 环境变量配置

前端环境变量（可选，在 `frontend/.env` 中配置）：
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCKS=false
```

### 数据库配置

后端数据库配置在 `backend/src/main/resources/application.yml`：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3308/edushareqa
    username: root
    password: 123456
```

### 构建生产版本

**前端构建**：
```bash
cd frontend
npm run build
```

**后端构建**：
```bash
cd backend
mvn clean package
```

## 常见问题

### 1. 前后端无法通信

- 检查后端是否在 `http://localhost:8080/api` 运行
- 检查前端 `env.ts` 中的 `apiBaseUrl` 配置
- 检查浏览器控制台的 CORS 错误

### 2. 数据库连接失败

- 确认 MySQL 服务已启动
- 确认端口为 3308
- 确认数据库 `edushareqa` 已创建
- 检查用户名密码是否正确

### 3. 文件上传失败

- 检查 `backend/uploads` 目录权限
- 确认文件大小不超过 50MB

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

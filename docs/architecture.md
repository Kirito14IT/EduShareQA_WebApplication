## 1. 总体架构概览
- **架构风格**：前后端分离、RESTful API + WebSocket 推送。  
- **技术栈**：  
  - 前端：React 18 + Vite + TypeScript + Ant Design + Redux Toolkit（含 RTK Query）。  
  - 后端：Spring Boot 3.2 + Spring MVC + Spring Security + JWT + MyBatis-Plus + Spring WebSocket。  
  - 数据库：MySQL 8.0（本地开发 → 云服务器）。  
  - 文件存储：本地磁盘（抽象存储接口，预留 OSS 扩展点）。  
  - 通知：WebSocket（实时）+ 后备轮询 API。  

```
┌────────────┐         HTTPS          ┌────────────────────┐
│ React SPA  │  <──────────────────>  │ Spring Boot API    │
│ (Vite)     │  REST / WebSocket      │ (Security + MyBatis│
└────────────┘                        │  + WebSocket)      │
        │                             └────────┬───────────┘
        │                                      │
        │                                  JDBC│
        ▼                                      ▼
   Local/OSS storage                      MySQL 8
```

## 2. 前端技术方案
| 组件 | 说明 |
| --- | --- |
| React 18 + Vite | 快速开发、支持 JSX/TSX、按需打包。 |
| TypeScript | 静态类型增强可靠性。 |
| Redux Toolkit + RTK Query | 管理全局状态（用户信息、通知、缓存），自动管理 API 请求。 |
| Ant Design 5 | 提供成熟的后台 UI 组件（表格、表单、上传、通知）。 |
| React Router v6 | 路由守卫，按角色拆分布局。 |
| Axios | 统一请求封装，支持拦截器注入 JWT。 |
| Socket.io Client / native WS | 建立与后端的 WebSocket 连接，实时接收通知。 |
| 富文本编辑器 | 使用 Toast UI / TinyMCE（轻量富文本）用于回答与资料说明。 |

**模块划分**  
- `auth`：登录/注册、Token 管理、守卫。  
- `dashboard`：根据角色渲染不同菜单。  
- `resources`：资源列表、上传表单、详情页。  
- `qa`：问答列表、提问表单、教师答疑面板。  
- `notifications`：站内信抽屉、已读/未读。  
- `admin`：课程、教师、内容管理。  

## 3. 后端技术方案
| 模块 | 技术 | 说明 |
| --- | --- | --- |
| REST 层 | Spring MVC | 控制器分角色命名空间（`/api/admin`, `/api/student`, `/api/teacher`）。 |
| 安全 | Spring Security + JWT | 登录成功签发 Access & Refresh Token；支持角色权限、方法级授权。 |
| 数据访问 | MyBatis-Plus | 简化 CRUD，统一实体与 DTO 转换。 |
| WebSocket | Spring WebSocket + STOMP | 推送问答通知；落地消息表确保可靠性。 |
| 文件上传 | Spring MVC Multipart + 本地持久化 | 利用配置项定义根目录，未来可替换为 OSS。 |
| 日志 | Spring Boot Actuator + Logback JSON | 记录操作日志、审计敏感操作。 |

**业务分层**  
- **Controller**：参数校验、调用 Service。  
- **Service**：编排业务逻辑、事务控制。  
- **Repository (Mapper)**：MyBatis-Plus Mapper 接口。  
- **Domain**：实体、DTO、VO。  
- **Infra**：存储适配器、文件服务、WebSocket 通道。  

## 4. 数据与存储
- **MySQL**：UTF8MB4，使用时间戳字段 `created_at`, `updated_at`。  
- **文件存储**：`/uploads/resources/{yyyy}/{MM}/{uuid}.{ext}`；数据库仅存路径与元数据。  
- **缓存（可选）**：如需热点加速，可引入 Redis 缓存热门资源/通知计数。  

## 5. 通知机制
1. 学生提问 → 写入 `questions`、附属 `question_attachment`。  
2. 教师订阅 WebSocket Topic `/topic/teacher/{id}`，收到所属课程新提问数。  
3. 教师回答 → 写入 `answers`，触发通知写表 `notifications` 并通过 `/topic/student/{id}` 推送。  
4. 若 WebSocket 不可达，前端每 60s 调用 `/notifications/unread` 轮询。  

## 6. 部署与环境
| 环境 | 描述 | 差异 |
| --- | --- | --- |
| 本地开发 | Windows + Node 18 + JDK 17 + MySQL 8 | Vite Dev Server、Spring Boot `dev` profile、本地上传目录。 |
| 集成测试 | Windows / Linux 虚拟机 | 构建后端 JAR、前端静态文件；同一机房部署。 |
| 预生产/生产 | 云服务器（Linux） | 使用 Docker Compose：Nginx（静态 + 反向代理）+ Spring Boot 容器 + MySQL + 挂载卷。 |

**CI/CD 建议**  
- Git 分支：`main`（稳定）、`develop`（集成）、`feature/*`。  
- Actions/Pipelines：前端 lint+test+build，后端单测+集成测试+镜像发布。  

## 7. 安全与合规
- JWT Access Token 15 分钟，Refresh Token 7 天；支持刷新接口。  
- 密码加密存储（BCrypt），登录失败次数限制。  
- 角色鉴权：  
  - 管理端接口需 `ROLE_ADMIN`。  
  - 教师接口校验课程归属。  
  - 学生资源/问题接口校验创建者。  
- 上传文件类型白名单（PDF、PNG、JPG、ZIP），扫描最大 50MB。  
- 日志审计：记录管理员删除操作、教师回答修改等关键事件。  

## 8. 扩展点
- 文件存储服务抽象，可无缝切换到阿里云 OSS。  
- 通知通道可新增邮件/短信。  
- 统计模块可接入 ClickHouse/ElasticSearch 以支持复杂分析。  


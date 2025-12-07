## 1. 约定
- **Base URL**：`/api`（生产环境由 Nginx 反向代理）  
- **鉴权**：JWT（Authorization: `Bearer <token>`）；登录成功返回 Access & Refresh Token。  
- **角色前缀**：
  - 学生端：`/student/**`
  - 教师端：`/teacher/**`
  - 管理端：`/admin/**`
- **分页参数**：`page`（默认 1），`pageSize`（默认 10，最大 50）  
- **排序**：默认按 `createdAt desc`；可通过 `sortField` + `sortOrder` 覆盖。  
- **时间**：统一 ISO8601，服务端存储 `TIMESTAMP(3)`。  

---

## 2. 数据库设计（MySQL 8）

| 表名 | 说明 |
| --- | --- |
| `users` | 所有用户（学生/教师/管理员） |
| `roles` | 角色字典（ADMIN/TEACHER/STUDENT） |
| `user_roles` | 用户与角色映射 |
| `courses` | 课程基础信息 |
| `course_teacher` | 课程与教师的多对多 |
| `resources` | 学习资源元数据 |
| `questions` | 学生提问 |
| `question_attachments` | 提问图片附件 |
| `answers` | 教师回答 |
| `answer_attachments` | 回答附件 |
| `notifications` | 站内通知（含已读状态） |
| `refresh_tokens` | 可选，跟踪活跃刷新 Token |

### 2.1 users
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | BIGINT PK | 雪花/自增 |
| `username` | VARCHAR(64) | 登录名（学生可用学号/邮箱） |
| `email` | VARCHAR(128) | 唯一 |
| `password_hash` | VARCHAR(255) | BCrypt |
| `full_name` | VARCHAR(64) | 姓名 |
| `avatar_url` | VARCHAR(255) | 头像 |
| `school_id` | VARCHAR(64) | 学号/工号 |
| `department` | VARCHAR(128) | 所属学院 |
| `status` | ENUM('ACTIVE','DISABLED') | 默认 ACTIVE |
| `created_at` | DATETIME |  |
| `updated_at` | DATETIME |  |

### 2.2 courses
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | BIGINT PK |  |
| `code` | VARCHAR(32) | 课程编号 |
| `name` | VARCHAR(128) | 课程名称 |
| `description` | TEXT | 课程介绍 |
| `faculty` | VARCHAR(128) | 开课学院 |
| `created_by` | BIGINT FK users | 管理员 |
| `created_at` | DATETIME |  |
| `updated_at` | DATETIME |  |

### 2.3 resources
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | BIGINT PK |  |
| `title` | VARCHAR(128) | 标题 |
| `summary` | TEXT | 简介/富文本 |
| `course_id` | BIGINT FK | 所属课程 |
| `uploader_id` | BIGINT FK users | 上传者 |
| `role_of_uploader` | ENUM('STUDENT','TEACHER') | |
| `file_path` | VARCHAR(255) | 本地相对路径 |
| `file_type` | VARCHAR(32) | pdf/png/zip |
| `file_size` | BIGINT | 字节 |
| `download_count` | INT | 默认 0 |
| `visibility` | ENUM('COURSE_ONLY','PUBLIC') | 可见范围 |
| `status` | ENUM('ACTIVE','DELETED') | 软删除 |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

### 2.4 questions & attachments
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `questions.id` | BIGINT PK |
| `course_id` | BIGINT FK |
| `student_id` | BIGINT FK |
| `title` | VARCHAR(128) |
| `content` | TEXT (支持富文本) |
| `status` | ENUM('OPEN','ANSWERED','CLOSED') |
| `answer_count` | INT default 0 |
| `created_at/updated_at` | DATETIME |

`question_attachments`：`id`, `question_id`, `file_path`, `file_type`, `file_size`.

### 2.5 answers & attachments
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | BIGINT PK |
| `question_id` | BIGINT FK |
| `teacher_id` | BIGINT FK |
| `content` | TEXT |
| `is_published` | TINYINT | 草稿预留 |
| `created_at/updated_at` | DATETIME |

`answer_attachments` 结构同上。

### 2.6 notifications
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | BIGINT PK |
| `recipient_id` | BIGINT FK users |
| `type` | ENUM('QUESTION_REPLIED','NEW_QUESTION') |
| `payload` | JSON | 相关 question/resource id |
| `is_read` | TINYINT | 0/1 |
| `read_at` | DATETIME NULL |
| `created_at` | DATETIME |

---

## 3. API 规范
> 仅列出关键接口，所有响应遵循 `{ "code":0, "message":"ok", "data":{} }`。

### 3.1 身份与鉴权
| 接口 | 方法 | 描述 |
| --- | --- | --- |
| `/auth/register` | POST | 学生注册 |
| `/auth/login` | POST | 登录，返回 access/refresh token |
| `/auth/refresh` | POST | 刷新 Token |
| `/auth/logout` | POST | 失效 Refresh Token |

**/auth/register**  
Request: `{ "username": "", "email": "", "password": "", "fullName": "", "schoolId": "", "department": "" }`  
Response: user profile。默认赋予 `ROLE_STUDENT`。

### 3.2 通用账户
| 接口 | 方法 | 描述 |
| --- | --- | --- |
| `/profile/me` | GET | 获取当前用户资料 |
| `/profile/me` | PUT | 更新头像、邮箱、部门 |
| `/profile/password` | PUT | 修改密码（旧密码 + 新密码） |

### 3.3 管理员模块
**课程管理**  
- `GET /admin/courses`：分页查询，支持 name/code 关键字。  
- `POST /admin/courses`：创建课程。  
- `PUT /admin/courses/{id}`：更新。  
- `DELETE /admin/courses/{id}`：软删。  

**教师管理**  
- `GET /admin/teachers`：列出教师 + 课程。  
- `POST /admin/teachers`：创建教师账号（自动发送随机密码邮件，可后续实现）。  
- `PUT /admin/teachers/{id}`：更新简介/职称。  
- `POST /admin/teachers/{id}/courses`：设置负责课程（body: `courseIds[]`).  

**内容治理**  
- `GET /admin/resources`：筛选资源，支持课程、上传者。  
- `DELETE /admin/resources/{id}`：删除违规资源。  
- `PUT /admin/resources/{id}`：修改简介或可见范围。  
- `GET /admin/questions` / `GET /admin/answers`：列表。  
- `DELETE /admin/questions/{id}` / `DELETE /admin/answers/{id}`。  

### 3.4 教师模块
| 接口 | 方法 | 描述 |
| --- | --- | --- |
| `/teacher/dashboard/stats` | GET | 未答问题数、资源下载情况 |
| `/teacher/questions` | GET | 按课程过滤未回答/全部问题 |
| `/teacher/questions/{id}` | GET | 详情，含附件 |
| `/teacher/questions/{id}/answers` | POST | 创建回答 |
| `/teacher/answers/{id}` | PUT/DELETE | 编辑/删除回答 |
| `/teacher/resources` | POST | 上传资源（multipart：`metadata` + `file`） |
| `/teacher/resources/{id}` | PUT/DELETE | 修改/删除 |
| `/teacher/resources` | GET | 自己上传的资源列表 |
| `/teacher/visibility/{resourceId}` | PUT | 切换 `COURSE_ONLY`/`PUBLIC` |

### 3.5 学生模块
| 接口 | 方法 | 描述 |
| --- | --- | --- |
| `/student/notifications` | GET | 分页已读/未读列表 |
| `/student/notifications/{id}/read` | POST | 标记已读 |
| `/student/resources` | GET | 资源浏览，支持课程/关键字 |
| `/student/resources/{id}` | GET | 详情（包含下载次数、可见范围） |
| `/student/resources/{id}/download` | POST | 下载记录 + 返回下载 URL |
| `/student/resources` | POST | 上传学习资料 |
| `/student/resources/{id}` | PUT/DELETE | 管理自己的资源 |
| `/student/questions` | POST | 提问（含附件） |
| `/student/questions` | GET | 查看自己提问或按课程过滤 |
| `/student/questions/search` | GET | 参数：`keyword`, `courseId`, `teacherId` |
| `/student/questions/{id}` | GET | 详情（含回答列表） |
| `/student/questions/{id}` | PUT/DELETE | 编辑/删除自己的提问 |

### 3.6 通知与 WebSocket
- REST：  
  - `GET /notifications/unread-count`：返回 `{ "newAnswers": 2, "pendingQuestions": 1 }`。  
  - `POST /notifications/{id}/read`。  
- WebSocket：  
  - 连接端点 `/ws`，订阅 `/topic/student/{userId}`、`/topic/teacher/{userId}`。  
  - 消息格式：`{ "type":"QUESTION_REPLIED", "questionId":123, "message":"您的问题已有新回答" }`。  

### 3.7 上传/下载
- **上传限制**：单文件 ≤ 50MB；后端校验 MIME 类型。  
- **资源下载流程**：前端调用 `POST /student/resources/{id}/download` → 服务端校验权限、记录次数 → 返回临时下载 URL（可直接返回 `file_path` 对象存储地址或受保护的 `/files/{token}`）。  

---

## 4. 业务规则总结
1. **教师问题可见性**：查询 `/teacher/questions` 时服务端根据教师 ID + `course_teacher` 过滤。  
2. **资源可见范围**：  
   - `PUBLIC`：所有登录用户可见。  
   - `COURSE_ONLY`：仅课程负责教师 + 选课学生可见（学生以“最近访问过该课程”或管理员配置的选课名单实现，初期可默认所有学生都算“课程成员”，后续扩展选课表）。  
3. **通知已读**：`notifications` 表 `is_read=1`，记录 `read_at`；WebSocket 推送后端仍写入数据库以保证幂等。  
4. **教师账号创建**：管理员创建后默认随机密码并标记 `FORCE_RESET_PASSWORD`，教师首次登录需修改密码。  
5. **软删除**：资源、问题、回答均通过 `status` 标记，不立即清表。  
6. **统计字段**：`resources.download_count`、`questions.answer_count` 由数据库触发器或服务层同步更新。  

---

## 5. 示例
### 5.1 创建问题
```
POST /student/questions
Content-Type: multipart/form-data
fields:
  metadata: {
    "courseId": 101,
    "title": "第二章例题 3 的推导",
    "content": "<p>请问......</p>"
  }
  attachments[]: image/png
```

Response:
```
{
  "id": 501,
  "status": "OPEN",
  "createdAt": "2025-11-25T08:15:00Z"
}
```

### 5.2 教师回答推送
```
{
  "type": "QUESTION_REPLIED",
  "questionId": 501,
  "answerId": 880,
  "message": "《WEB应用开发》张老师回复了你的问题"
}
```


# EduShareQA Frontend

React + TypeScript 单页应用，用于支撑文档中描述的 EduShareQA “学生学习资源与问答”场景。此前端遵循 `docs/openapi.yaml` 的接口契约，可在 Mock 模式下先行开发，待后端可用再切换到真实 API。

## 快速开始

```bash
cd frontend
npm install
cp .env.example .env               # 按需修改再运行
npm run dev
```

- `VITE_API_BASE_URL`：指向后端 API 根路径，默认 `http://localhost:8080/api`。
- `VITE_USE_MOCKS`：`true` 走内存 Mock，允许“前端先行”；设置为 `false` 即调用真实后端。

## 常用脚本

| 命令 | 功能 |
| --- | --- |
| `npm run dev` | 本地开发（含 HMR） |
| `npm run build` | TypeScript 检查 + 产物打包 |
| `npm run preview` | 预览生产构建结果 |

## 已实现功能

- **登录 / 注册**：调用 `/auth/login`、`/auth/register`，随后访问 `/profile/me` 获取 `UserProfile`，并用 `zustand + localStorage` 持久化 token。
- **学习资源**：课程筛选、关键字搜索、分页、单文件上传（字段与 `ResourceMetadata` 一致）。
- **学生提问**：我的提问列表、状态过滤、提问表单（支持附件占位），契合 `/student/questions`。
- **通知中心**：展示 `/notifications/unread-count` 返回的“新回答 / 待处理”指标，主导航徽标实时跟进。

## 技术栈

- Vite + React 18 + TypeScript
- React Router 7 构建受保护路由
- @tanstack/react-query 负责数据拉取/缓存，并通过 `placeholderData` 保留上次数据
- Zustand 管理鉴权状态
- Axios + FormData 封装真实上传流程，Mock 逻辑内置于 `src/api/mockApi.ts`

## 与后端协作

1. 完成接口/字段调整时，优先更新 `docs/openapi.yaml`。
2. 同步修改 `src/types/api.ts`，确保页面引用的类型与 OpenAPI 一致。
3. 切换到真实后端：编辑 `.env` -> `VITE_USE_MOCKS=false`，填好真实 `VITE_API_BASE_URL`，重新运行 `npm run dev`。
4. 建议配合 `@redocly/cli` 进行 OpenAPI 校验 / 生成客户端。

## 目录概览

```
src/
  api/                # axios 封装 + mock 实现
  components/         # 布局、保护路由、通知徽标
  pages/              # 登录、资源、提问、通知等页面
  store/              # 鉴权状态（zustand）
  types/              # 与 OpenAPI 对齐的数据结构
```

## 后续扩展建议

- 使用真实课程/字典接口取代页面内的示例数组。
- 接入 React Testing Library + MSW 做组件/契约测试。
- 在上传、提问流程补充文件大小校验、加载 skeleton、乐观更新等体验优化。


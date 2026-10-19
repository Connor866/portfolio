# 个人作品集网站

赵康 · 大连海事大学 计算机科学与技术

一个纯前端实现的个人展示网站，包含**前台展示端**与 `/admin` **管理后台**。不依赖任何后端服务，数据保存于浏览器本地，可直接部署到 Cloudflare Pages。

## 功能

**前台**

- 首屏个人介绍、头像、简历下载
- 关于我：个人简介、社交链接、教育背景、成长轨迹
- 技能栈：按分类展示熟练度进度条
- 项目经历：项目卡片、技术标签、外部链接、可选封面图
- 技术文章：Markdown 渲染的博客列表与详情页
- 深色星空主题、滚动入场动画、响应式布局

**后台（`/admin`）**

- 登录鉴权（本地会话）
- 个人信息编辑：基本信息、社交链接、教育背景、成长轨迹
- 头像上传（自动压缩至 512px）与简历文件上传
- 技能管理：增删、分类、熟练度调整
- 项目管理：增删、标签、链接、封面
- 文章管理：Markdown 编辑 + 实时预览
- 站点设置：站点名称、页脚文案、一键清除本地数据

## 技术栈

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4（CSS-first 配置，无 tailwind.config.js）
- React Router 7
- react-markdown

## 本地运行

```bash
npm install
npm run dev        # 开发服务器
npm run build      # 类型检查 + 生产构建，产物在 dist/
npm run preview    # 预览构建产物
```

需要 Node.js 22.12 及以上（Vite 8 的要求）。

## 管理后台

访问 `/admin`，演示账号：

- 账号：`admin`
- 密码：`admin123`

登录后修改的内容会立即同步到前台。

> 这是为课程演示设计的纯前端鉴权，账号密码写在代码里，不具备真实的安全性，不应用于生产环境。

## 数据存储

- 首次访问展示 `src/data/*.ts` 中的静态默认数据
- 后台修改后写入浏览器 `localStorage`（key 统一前缀 `kp.`）与 `IndexedDB`（头像、简历文件）
- 数据写入后会广播 `kp:data-changed` 事件，前台组件自动刷新
- 换浏览器 / 清除站点数据后会恢复为默认内容

## 部署到 Cloudflare Pages

| 配置项 | 值 |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Framework preset | Vite |
| 环境变量 | `NODE_VERSION=22` |

SPA 路由回退由 `public/_redirects` 提供：

```
/*  /index.html  200
```

## 文档

- [PRD.md](./PRD.md) — 产品需求文档
- [TECH_DESIGN.md](./TECH_DESIGN.md) — 技术设计文档
- [AGENTS.md](./AGENTS.md) — AI 协作开发规范

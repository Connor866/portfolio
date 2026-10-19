# 个人作品集网站 TECH_DESIGN（技术设计文档）

| 项目 | 内容 |
|---|---|
| 对应文档 | `PRD.md` v1.0 |
| 技术负责人 | 赵康 |
| 更新日期 | 2026-10-19 |

---

## 一、技术栈选择

### 1.1 总体原则

- **纯前端**：不使用任何后端语言，所有逻辑在浏览器中运行。
- **零服务成本**：静态构建产物直接托管，长期免费。
- **可替换数据层**：所有读写收口到 `src/api/`，未来接入真实后端只改这一层。

### 1.2 选型清单

| 层 | 选型 | 版本 | 说明 |
|---|---|---|---|
| 语言 | TypeScript | 5.x | 类型安全，前后台共享类型定义 |
| 框架 | React | 19.x | 组件化，生态最大 |
| 构建 | Vite | 7.x | 冷启动快，产物小，Cloudflare Pages 原生支持 |
| 样式 | Tailwind CSS | 4.x | 原子化 CSS，通过 `@tailwindcss/vite` 插件接入 |
| 路由 | react-router-dom | 7.x | 前台 `/` 与后台 `/admin/*` 分离 |
| Markdown | react-markdown | 10.x | 博客渲染，纯前端解析 |
| 校验 | zod | 4.x | 表单 schema 校验，错误信息结构化 |
| 数据存储 | localStorage + IndexedDB | 浏览器原生 | 文字存 localStorage，文件存 IndexedDB |
| 部署 | Cloudflare Pages | — | 免费、不限流量、全球 CDN、GitHub 自动部署 |

### 1.3 为什么不用后端 / 数据库

作业要求「纯前端框架实现，数据采用静态本地存储（如 TS 文件或 MD 文件）」。因此：

- **默认数据**放在 `src/data/*.ts` 与 `src/content/posts/*.md`，随代码一起构建；
- **后台修改**保存在浏览器本地（localStorage / IndexedDB），实现「改完前台立刻变」；
- 数据访问通过 `src/api/` 抽象，未来接入 Cloudflare KV 或 Supabase 时，只需替换该层实现，页面代码不动。

---

## 二、项目结构

```
portfolio/
├── public/
│   └── _redirects              # SPA 路由回退规则（Cloudflare Pages 必须）
├── src/
│   ├── main.tsx                # 应用入口，挂载路由
│   ├── App.tsx                 # 路由表
│   ├── index.css               # Tailwind 引入 + 全局样式 + 主题变量
│   │
│   ├── types/
│   │   └── index.ts            # Profile / Skill / Project / Post / SiteSettings
│   │
│   ├── data/                   # 【静态默认数据】构建时打包进产物
│   │   ├── profile.ts
│   │   ├── skills.ts
│   │   ├── projects.ts
│   │   ├── posts.ts
│   │   └── settings.ts
│   │
│   ├── api/                    # 【统一数据层】页面只调用这里
│   │   ├── storage.ts          # localStorage 封装 + IndexedDB 文件读写
│   │   ├── profile.ts
│   │   ├── skills.ts
│   │   ├── projects.ts
│   │   ├── posts.ts
│   │   └── settings.ts
│   │
│   ├── auth/
│   │   └── auth.ts             # 登录、登出、token 校验
│   │
│   ├── components/             # 通用组件
│   │   ├── Starfield.tsx       # Canvas 星空粒子背景
│   │   ├── Navbar.tsx          # 前台吸顶导航
│   │   ├── Footer.tsx
│   │   ├── Reveal.tsx          # 滚动淡入动画容器
│   │   ├── Section.tsx         # 区块标题容器
│   │   └── Toast.tsx           # 全局提示
│   │
│   ├── pages/
│   │   ├── Home.tsx            # 前台单页（含 6 个区块）
│   │   ├── BlogPost.tsx        # 博客详情 /blog/:slug
│   │   └── admin/
│   │       ├── AdminLayout.tsx # 后台布局：侧边栏 + 顶栏 + 路由守卫
│   │       ├── Login.tsx
│   │       ├── Dashboard.tsx
│   │       ├── ProfileAdmin.tsx
│   │       ├── SkillsAdmin.tsx
│   │       ├── ProjectsAdmin.tsx
│   │       ├── PostsAdmin.tsx
│   │       └── SettingsAdmin.tsx
│   │
│   └── hooks/
│       ├── useLocalData.ts     # 读写本地数据的通用 hook
│       └── useReveal.ts
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── PRD.md
├── TECH_DESIGN.md
└── AGENTS.md
```

### 2.1 分层约定

| 层 | 职责 | 禁止 |
|---|---|---|
| `pages/` | 页面编排、渲染 | 不直接读写 localStorage |
| `components/` | 可复用 UI | 不含业务逻辑 |
| `api/` | 数据读写、默认值回退 | 不含 JSX |
| `data/` | 静态默认数据 | 不写逻辑 |
| `types/` | 类型定义 | 不放运行时代码 |

---

## 三、数据模型

### 3.1 核心类型

```ts
// src/types/index.ts

/** 社交链接 */
export interface SocialLink {
  label: string;   // 显示名，如 "GitHub"
  url: string;     // 完整链接
}

/** 经历 / 教育条目 */
export interface TimelineItem {
  id: string;
  time: string;        // "2023.09 - 至今"
  title: string;       // "大连海事大学 · 计算机科学与技术"
  description: string;
}

/** 个人信息（后台可改） */
export interface Profile {
  name: string;
  title: string;        // 职位 / 身份
  tagline: string;      // 一句话介绍
  bio: string;          // 详细简介
  location: string;
  email: string;
  avatar: string;       // 头像（IndexedDB 中读取后转成的 objectURL / dataURL）
  resumeFileName: string; // 简历文件名，空字符串表示未上传
  socials: SocialLink[];
  timeline: TimelineItem[];
  education: TimelineItem[];
}

/** 技能 */
export interface Skill {
  id: string;
  category: string;   // "前端" | "后端" | "工具"
  name: string;
  level: number;      // 0 - 100
}

/** 项目经历 */
export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  cover: string;      // 封面图 URL 或 dataURL
  link: string;
  date: string;       // "2026.05"
}

/** 博客文章 */
export interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  date: string;
  content: string;    // Markdown 原文
}

/** 站点设置 */
export interface SiteSettings {
  siteName: string;
  footerText: string;
}
```

### 3.2 存储设计

| 数据 | 位置 | Key |
|---|---|---|
| 个人信息 | localStorage | `kp.profile` |
| 技能列表 | localStorage | `kp.skills` |
| 项目列表 | localStorage | `kp.projects` |
| 文章列表 | localStorage | `kp.posts` |
| 站点设置 | localStorage | `kp.settings` |
| 登录 token | localStorage | `kp.token` |
| 头像文件 | IndexedDB `kp-files` / `files` | `avatar`（Blob） |
| 简历文件 | IndexedDB `kp-files` / `files` | `resume`（Blob） |

### 3.3 读取策略（默认值回退）

```
读取某个数据时：
  1. 尝试读 localStorage
  2. 读到且格式合法 → 直接返回
  3. 读不到 / JSON 解析失败 / 结构不符 → 返回 src/data 中的默认值
```

这样保证：**任何情况下页面都不会空白崩溃**；老师第一次打开部署好的网址，看到的是 TS 文件里的完整内容。

### 3.4 写入策略

```
保存时：
  1. zod 校验表单数据
  2. 通过 → 写入 localStorage，提示「已保存」
  3. 失败 → 字段下方显示错误，不写入
```

---

## 四、关键技术点

### 4.1 后台修改如何传递到前台

前台与后台是同一个 SPA，共享同一份 localStorage。关键实现：

- `src/api/*.ts` 暴露 `get` / `save` 函数；
- 页面通过 `useLocalData(key)` 订阅数据；
- **保存后派发自定义事件** `window.dispatchEvent(new Event('kp:data-changed'))`；
- 前台收到事件后重新读取数据并 `setState`，实现**无需刷新页面即可看到变化**。

### 4.2 头像与简历文件存储（IndexedDB）

localStorage 只能存字符串且有约 5MB 上限，PDF 简历转为 base64 很容易超限。因此：

- 文件统一以 `Blob` 存入 IndexedDB 的 `files` 表；
- 读取时用 `URL.createObjectURL(blob)` 生成临时地址，供 `<img>` 与下载链接使用；
- 组件卸载时 `URL.revokeObjectURL` 释放内存；
- 上传前校验：头像 ≤ 2MB 且必须是图片，简历 ≤ 5MB 且必须是 PDF。

### 4.3 Canvas 星空背景

- 使用 `requestAnimationFrame` 绘制粒子，每个粒子有坐标、半径、速度、闪烁相位；
- 适配 `devicePixelRatio`，避免高分屏模糊；
- 监听 `resize` 重算画布尺寸与粒子数量；
- **性能降级**：宽度 < 768px 时粒子数减半；
- 尊重 `prefers-reduced-motion: reduce`：不播放动画，只绘制静态星点。

### 4.4 后台路由守卫

- `AdminLayout` 在渲染前检查 `kp.token` 是否存在且未过期；
- 未登录 → `<Navigate to="/admin/login" replace />`；
- 登录页反向守卫：已登录访问 `/admin/login` 直接跳 `/admin`。

### 4.5 SPA 路由回退（部署必踩的坑）

Cloudflare Pages 是静态托管，直接访问 `/admin/projects` 会去找对应 HTML 文件而 404。解决方式：在 `public/_redirects` 写入：

```
/*  /index.html  200
```

### 4.6 Markdown 渲染安全

- 使用 `react-markdown`，**不开启** `rehype-raw`，避免渲染原始 HTML；
- 文章内容只来自管理员本地输入，不接收外部提交。

### 4.7 表单校验

使用 zod 定义 schema，统一错误提取：

```ts
const profileSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  title: z.string().min(1, '职位不能为空'),
  email: z.string().email('邮箱格式不正确'),
  tagline: z.string().max(60, '一句话介绍不超过 60 字'),
});
```

---

## 五、构建与部署

### 5.1 本地开发

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产物输出到 dist/
```

### 5.2 Cloudflare Pages 配置

| 配置项 | 值 |
|---|---|
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| 框架预设 | `Vite` |
| 环境变量 | `NODE_VERSION = 22` |

### 5.3 部署流程

1. 代码推送到 GitHub 仓库；
2. Cloudflare 控制台 → Workers 和 Pages → 创建应用 → 连接到 Git → 选择仓库；
3. 核对构建命令与输出目录；
4. 部署完成后获得 `https://<项目名>.pages.dev` 域名。

---

## 六、测试策略

| 类型 | 方式 |
|---|---|
| 构建校验 | `npm run build` 必须零错误 |
| 类型校验 | `tsc -b` 通过 |
| 功能自测 | 按 `PRD.md` 第六章逐条验收 |
| 响应式 | Chrome DevTools 切换 375 / 768 / 1440 三档 |
| 线上验收 | 部署后重新走一遍验收标准 |

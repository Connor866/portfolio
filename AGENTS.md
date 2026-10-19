# AGENTS.md —— AI 开发规范

> 本文件面向参与本项目的 AI 编程助手（Cursor / Trae / Claude Code 等）。
> 动手前请先读完 `PRD.md` 与 `TECH_DESIGN.md`，本文件只规定「怎么做事」。

---

## 一、项目概述

| 项 | 说明 |
|---|---|
| 项目 | 赵康的个人作品集网站（前台展示 + `/admin` 后台管理） |
| 作者 | 赵康 · 大连海事大学 计算机科学与技术 |
| 技术栈 | React 19 + TypeScript + Vite + Tailwind CSS 4 + react-router-dom 7 |
| 数据 | 纯前端。默认数据在 `src/data/`，后台修改存 localStorage / IndexedDB |
| 部署 | Cloudflare Pages（静态托管，`npm run build` → `dist`） |
| 运行 | `npm install` → `npm run dev` → `http://localhost:5173` |

**一句话原则：这是纯前端项目，任何时候都不要引入后端语言（Python / Go / Java）、数据库服务或自建服务器。**

---

## 二、必须遵守的硬性约定

### 2.1 目录分层

```
pages/      页面编排，只做「取数据 + 渲染」
components/ 通用 UI，不含业务逻辑
api/        所有数据读写，页面禁止直接碰 localStorage
data/       静态默认数据，只放数据不放逻辑
types/      类型定义，前后台共用
```

**禁止**在页面组件里直接写 `localStorage.getItem(...)`。要读数据，一律走 `src/api/`。

### 2.2 数据流

1. 读：`api` 先查 localStorage → 没有或解析失败 → 回退到 `src/data` 默认值。
2. 写：zod 校验 → 写入 → `notifyChanged()` 派发 `kp:data-changed` 事件。
3. 页面用 `useLocalData()` 订阅，自动重渲染。

**不允许**为了图省事让页面自己维护一份数据副本、绕开 api 层。

### 2.3 路由

| 路径 | 页面 |
|---|---|
| `/` | 前台单页 |
| `/blog/:slug` | 博客详情 |
| `/admin/login` | 后台登录 |
| `/admin` | 仪表盘 |
| `/admin/profile` 等 | 后台各管理页 |

- 后台路由必须被 `AdminLayout` 的守卫包裹。
- 新增后台页面后，同步更新 `AdminLayout` 的侧边栏菜单。

### 2.4 样式

- 只用 Tailwind 工具类 + `src/index.css` 里定义的 CSS 变量，**不写独立 CSS 文件**。
- 颜色统一用主题变量（`bg-night`、`text-ink`、`text-dim`、`brand`、`brand2`），**禁止**在组件里散落新的十六进制色值。
- 圆角：卡片 `rounded-2xl`，按钮与输入框 `rounded-xl`。
- 过渡统一 `transition-colors duration-200` 或 `duration-300`。

---

## 三、代码风格

### 3.1 TypeScript

- 开启 `strict`，**禁止使用 `any`**；实在不确定用 `unknown` 并做类型收窄。
- 类型定义集中在 `src/types/index.ts`，不在页面里重复声明。
- 使用 `interface` 描述对象结构，使用 `type` 描述联合类型。
- 事件类型显式标注，如 `React.ChangeEvent<HTMLInputElement>`。

### 3.2 组件

- 函数组件 + Hooks，不使用 class 组件。
- 组件文件名用 PascalCase（`Starfield.tsx`），一个文件一个默认导出组件。
- Props 用 `interface XxxProps` 显式声明。
- 列表渲染必须有稳定的 `key`（使用数据里的 `id`，**不要用数组下标**）。
- 副作用统一放在 `useEffect`，并在返回函数里清理监听器、定时器、`requestAnimationFrame`。

### 3.3 命名

| 类型 | 规范 | 示例 |
|---|---|---|
| 组件 | PascalCase | `ProfileAdmin` |
| 函数 / 变量 | camelCase | `saveProfile` |
| 常量 | UPPER_SNAKE_CASE | `DATA_CHANGED_EVENT` |
| 类型 / 接口 | PascalCase | `Profile` |
| CSS 变量 | kebab-case | `--color-brand` |

### 3.4 注释

- 注释解释「**为什么**」，不解释「是什么」。
- 每个 `api/` 导出的函数写一句 JSDoc 说明用途与返回值。
- 复杂逻辑（星空粒子的性能降级、IndexedDB 的 Promise 封装）必须写注释。
- **不要**给显而易见的代码加废话注释。

---

## 四、开发流程要求

### 4.1 每次改动前

1. 先说明「要改哪个文件、改成什么样」，再动手。
2. 跨 3 个以上文件的改动，先给出方案让用户确认。

### 4.2 每次改动后（必须自查）

- [ ] `npm run build` 是否零报错？
- [ ] 控制台是否有红色警告？
- [ ] 改动的功能是否在前台/后台**实际点过一遍**？
- [ ] 是否引入了新的依赖？新依赖是否必要？
- [ ] 是否破坏了已有功能？

### 4.3 提交规范

每完成一个可独立验证的功能就提交一次，提交信息格式：

```
feat: 新增技能管理页面
fix: 修复后台保存后前台不刷新
style: 统一卡片圆角
docs: 更新 PRD
refactor: 抽取 useLocalData
```

---

## 五、测试要求

| 层级 | 要求 |
|---|---|
| 构建 | `npm run build` 必须通过，不能靠 `// @ts-ignore` 绕过 |
| 类型 | `tsc --noEmit` 零错误 |
| 功能 | 按 `PRD.md` 第六章「验收标准」逐条手工验收 |
| 响应式 | 至少检查 375px / 768px / 1440px 三档宽度 |
| 数据 | 手动清空 localStorage 后，页面必须仍能正常展示默认内容 |

**功能写完不等于完成，验收标准过了才算完成。**

---

## 六、注意事项（踩过的坑）

1. **`/admin` 刷新 404**：Cloudflare Pages 需要 `public/_redirects`，内容为 `/*  /index.html  200`，不要删。
2. **不要在 `useEffect` 里忘记清理 RAF**，否则切页面后星空仍在跑，内存泄漏。
3. **IndexedDB 是异步的**：头像与简历必须用 `await getFile()` 读取，不能当成同步值用。
4. **localStorage 有 5MB 上限**：大文件（简历 PDF）一律走 IndexedDB，不要转 base64 塞进 localStorage。
5. **Tailwind 4 不需要 `tailwind.config.js`**：主题变量写在 `src/index.css` 的 `@theme` 块里。
6. **Markdown 渲染不要开 `rehype-raw`**：会带来 XSS 风险。
7. **不要用数组下标当 key**：后台增删后会导致输入框错位。
8. **不要把密码存进 localStorage**：登录只存 token。
9. **SVG / 图片资源**：能内联就用内联 SVG 或 CSS 绘制，避免为小图标引入图片文件。
10. **中文字体栈**：`system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif`。

---

## 七、禁止事项

- ❌ 引入 UI 组件库（Ant Design / MUI / Element Plus 等）——会显著增大体积。
- ❌ 引入状态管理库（Redux / Zustand / MobX）——本项目规模用不到。
- ❌ 使用 `any`、`@ts-ignore`、`eslint-disable` 掩盖问题。
- ❌ 提交 `node_modules`、`dist`、`.env`。
- ❌ 在代码里写死真实密码、令牌、密钥。
- ❌ 修改 `PRD.md` / `TECH_DESIGN.md` 的验收标准来「迁就」代码——应该改代码。

---

## 八、完成定义（Definition of Done）

一个功能算「做完了」，必须同时满足：

1. 功能按 PRD 描述正常工作；
2. `npm run build` 通过；
3. 桌面端与 375px 移动端都不错位；
4. 有加载态 / 空状态 / 错误提示；
5. 代码里没有 `any` 与未清理的副作用；
6. 已本地提交一次 Git。

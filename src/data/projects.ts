import type { Project } from '../types'

/** 项目经历的静态默认值（首次访问时展示） */
export const defaultProjects: Project[] = [
  {
    id: 'pj-1',
    title: '电商图片提取下载插件',
    summary:
      'Chrome 扩展：在淘宝 / 天猫 / 京东 / 拼多多商家版商品详情页一键提取全部商品图，集中预览并批量转 PNG 下载。',
    description:
      '基于 Manifest V3 开发。内容脚本负责注入悬浮按钮与扫描图片（兼容 srcset、data-src、background-image 等懒加载写法），后台 Service Worker 通过 fetch + createImageBitmap + OffscreenCanvas 在跨域条件下完成格式转换，画廊页负责勾选与批量下载。',
    tags: ['Chrome MV3', 'JavaScript', 'Canvas'],
    cover: '',
    link: 'https://github.com/Connor866/image-grab',
    date: '2026.10',
  },
  {
    id: 'pj-2',
    title: '网页内容总结工具',
    summary:
      '输入一个网址，自动抓取正文内容并调用大模型生成中文摘要，帮助快速判断一篇长文值不值得读。',
    description:
      '前端使用 React 搭建，服务端用 Express + cheerio 解析页面正文，接入大模型 API 完成摘要生成。实现了加载动画、错误提示与摘要复制等功能。',
    tags: ['React', 'Express', '大模型 API'],
    cover: '',
    link: '',
    date: '2026.09',
  },
  {
    id: 'pj-3',
    title: '个人作品集网站',
    summary:
      '你现在正在看的这个站点：深色星空主题，前台展示 + /admin 后台管理，纯前端实现，Cloudflare Pages 部署。',
    description:
      '使用 React 19 + TypeScript + Vite + Tailwind CSS 4 构建。数据层采用「静态 TS 默认值 + 浏览器本地覆盖」方案：后台修改写入 localStorage 与 IndexedDB，通过自定义事件通知前台即时刷新，无需任何后端服务。',
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
    cover: '',
    link: 'https://github.com/Connor866',
    date: '2026.10',
  },
]

import type { Profile } from '../types'

/**
 * 个人信息的静态默认值。
 * 后台修改后的内容会覆盖这里的数据；首次访问时展示的就是这一份。
 */
export const defaultProfile: Profile = {
  name: '赵康',
  title: '计算机科学与技术 · 本科在读',
  tagline: '用代码把想法变成能真正跑起来的产品。',
  bio: '我是赵康，大连海事大学计算机科学与技术专业的学生。平时主要折腾前端与浏览器扩展，喜欢把「重复几十次的手工操作」拆解成一个能一键完成的小工具。正在系统学习 React 与 TypeScript，也在补操作系统和计算机网络这些底子。',
  location: '辽宁 · 大连',
  email: 'zhaokang@example.com',
  avatarFileName: '',
  resumeFileName: '',
  socials: [
    { label: 'GitHub', url: 'https://github.com/Connor866' },
    { label: 'Email', url: 'mailto:zhaokang@example.com' },
  ],
  timeline: [
    {
      id: 'tl-1',
      time: '2023.09 — 至今',
      title: '大连海事大学 · 计算机科学与技术',
      description:
        '本科在读，主修数据结构、操作系统、计算机网络、数据库系统等核心课程。',
    },
    {
      id: 'tl-2',
      time: '2025.09 — 2026.06',
      title: '前端开发系统学习',
      description:
        '从 HTML/CSS 到 React + TypeScript，完成多个课程实践项目，逐步形成组件化与类型优先的开发习惯。',
    },
    {
      id: 'tl-3',
      time: '2026.07 — 至今',
      title: '独立开发实践',
      description:
        '独立完成 Chrome 扩展、网页内容总结工具、个人作品集网站等项目，完整走通需求分析 → 开发 → 部署的流程。',
    },
  ],
  education: [
    {
      id: 'edu-1',
      time: '2023.09 — 至今',
      title: '大连海事大学 · 计算机科学与技术',
      description: '本科 · 计算机类',
    },
  ],
}

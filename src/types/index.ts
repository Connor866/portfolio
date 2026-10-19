/**
 * 全局类型定义
 * 前台展示端与后台管理端共用，保证数据结构一致。
 */

/** 社交链接 */
export interface SocialLink {
  label: string
  url: string
}

/** 经历 / 教育条目 */
export interface TimelineItem {
  id: string
  time: string
  title: string
  description: string
}

/** 个人信息 */
export interface Profile {
  name: string
  title: string
  tagline: string
  bio: string
  location: string
  email: string
  /** 头像文件名；为空表示使用默认的文字头像 */
  avatarFileName: string
  /** 简历文件名；为空表示未上传 */
  resumeFileName: string
  socials: SocialLink[]
  timeline: TimelineItem[]
  education: TimelineItem[]
}

/** 技能 */
export interface Skill {
  id: string
  category: string
  name: string
  /** 熟练度 0 - 100 */
  level: number
}

/** 项目经历 */
export interface Project {
  id: string
  title: string
  summary: string
  description: string
  tags: string[]
  cover: string
  link: string
  date: string
}

/** 博客文章 */
export interface Post {
  id: string
  slug: string
  title: string
  summary: string
  tags: string[]
  date: string
  /** Markdown 原文 */
  content: string
}

/** 站点设置 */
export interface SiteSettings {
  siteName: string
  footerText: string
}

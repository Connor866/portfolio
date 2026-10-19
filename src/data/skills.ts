import type { Skill } from '../types'

/** 技能的静态默认值（首次访问时展示） */
export const defaultSkills: Skill[] = [
  // 前端
  { id: 'sk-1', category: '前端', name: 'HTML / CSS', level: 88 },
  { id: 'sk-2', category: '前端', name: 'JavaScript', level: 82 },
  { id: 'sk-3', category: '前端', name: 'TypeScript', level: 76 },
  { id: 'sk-4', category: '前端', name: 'React', level: 78 },
  { id: 'sk-5', category: '前端', name: 'Tailwind CSS', level: 72 },

  // 后端与数据
  { id: 'sk-6', category: '后端与数据', name: 'Node.js', level: 62 },
  { id: 'sk-7', category: '后端与数据', name: 'Python', level: 68 },
  { id: 'sk-8', category: '后端与数据', name: 'MySQL', level: 60 },

  // 工具与工程化
  { id: 'sk-9', category: '工具与工程化', name: 'Git / GitHub', level: 78 },
  { id: 'sk-10', category: '工具与工程化', name: 'Vite', level: 70 },
  { id: 'sk-11', category: '工具与工程化', name: 'Chrome 扩展开发', level: 75 },
  { id: 'sk-12', category: '工具与工程化', name: 'AI 辅助编程', level: 80 },
]

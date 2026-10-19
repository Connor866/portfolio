import type { Project } from '../types'
import { defaultProjects } from '../data/projects'
import { readJSON, removeKey, writeJSON } from './storage'

const KEY = 'projects'

/** 读取项目经历 */
export function getProjects(): Project[] {
  return readJSON<Project[]>(KEY, defaultProjects)
}

/** 保存项目经历 */
export function saveProjects(projects: Project[]): void {
  writeJSON<Project[]>(KEY, projects)
}

/** 恢复默认项目 */
export function resetProjects(): void {
  removeKey(KEY)
}

import type { Skill } from '../types'
import { defaultSkills } from '../data/skills'
import { readJSON, removeKey, writeJSON } from './storage'

const KEY = 'skills'

/** 读取技能列表 */
export function getSkills(): Skill[] {
  return readJSON<Skill[]>(KEY, defaultSkills)
}

/** 保存技能列表 */
export function saveSkills(skills: Skill[]): void {
  writeJSON<Skill[]>(KEY, skills)
}

/** 恢复默认技能 */
export function resetSkills(): void {
  removeKey(KEY)
}

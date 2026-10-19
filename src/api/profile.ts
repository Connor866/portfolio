import type { Profile } from '../types'
import { defaultProfile } from '../data/profile'
import { readJSON, removeKey, writeJSON } from './storage'

const KEY = 'profile'

/** 读取个人信息：本地有覆盖就用本地，否则用静态默认值 */
export function getProfile(): Profile {
  return readJSON<Profile>(KEY, defaultProfile)
}

/** 保存个人信息（后台调用） */
export function saveProfile(profile: Profile): void {
  writeJSON<Profile>(KEY, profile)
}

/** 恢复默认个人信息 */
export function resetProfile(): void {
  removeKey(KEY)
}

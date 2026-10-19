import type { SiteSettings } from '../types'
import { defaultSettings } from '../data/settings'
import { readJSON, removeKey, writeJSON } from './storage'

const KEY = 'settings'

/** 读取站点设置 */
export function getSettings(): SiteSettings {
  return readJSON<SiteSettings>(KEY, defaultSettings)
}

/** 保存站点设置 */
export function saveSettings(settings: SiteSettings): void {
  writeJSON<SiteSettings>(KEY, settings)
}

/** 恢复默认设置 */
export function resetSettings(): void {
  removeKey(KEY)
}

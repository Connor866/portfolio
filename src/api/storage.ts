/**
 * 数据层基础设施
 *
 * 设计要点：
 * 1. 所有业务数据存在 localStorage（key 统一加 `kp.` 前缀）。
 * 2. 首次访问时没有本地数据 → 读取 src/data/*.ts 里的静态默认值。
 * 3. 文件（头像、简历）体积大，单独存 IndexedDB。
 * 4. 任何写入都会广播 `kp:data-changed`，前台订阅后立即重新渲染。
 */

/** 数据变更事件名 */
export const DATA_CHANGED_EVENT = 'kp:data-changed'

/** localStorage key 前缀 */
const PREFIX = 'kp.'

/** IndexedDB 配置 */
const DB_NAME = 'kp-files'
const DB_VERSION = 1
const STORE_NAME = 'files'

/** 通知全局：数据变了 */
export function notifyChanged(): void {
  window.dispatchEvent(new Event(DATA_CHANGED_EVENT))
}

/* ------------------------------------------------------------------ */
/* localStorage                                                        */
/* ------------------------------------------------------------------ */

/** 读取 JSON，不存在或解析失败时返回默认值 */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** 写入 JSON 并广播变更 */
export function writeJSON<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
  notifyChanged()
}

/** 删除某个 key（回到默认值）并广播变更 */
export function removeKey(key: string): void {
  localStorage.removeItem(PREFIX + key)
  notifyChanged()
}

/* ------------------------------------------------------------------ */
/* IndexedDB：文件存储（头像 / 简历）                                    */
/* ------------------------------------------------------------------ */

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return dbPromise
}

/** 保存文件，key 为文件名 */
export async function putFile(name: string, blob: Blob): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(blob, name)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** 读取文件，不存在返回 null */
export async function getFile(name: string): Promise<Blob | null> {
  if (!name) return null
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(name)
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null)
    request.onerror = () => reject(request.error)
  })
}

/** 删除文件 */
export async function deleteFile(name: string): Promise<void> {
  if (!name) return
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(name)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/* ------------------------------------------------------------------ */
/* 集合封装                                                            */
/* ------------------------------------------------------------------ */

export interface Collection<T> {
  /** 读取当前数据（本地优先，否则默认值） */
  list: () => T[]
  /** 整体覆盖保存 */
  save: (items: T[]) => void
  /** 清除本地覆盖，恢复默认值 */
  reset: () => void
  /** 本地是否已有覆盖数据 */
  isOverridden: () => boolean
}

/** 创建一个「静态默认值 + 本地覆盖」的集合 */
export function createCollection<T>(key: string, defaults: T[]): Collection<T> {
  return {
    list: () => readJSON<T[]>(key, defaults),
    save: (items: T[]) => writeJSON<T[]>(key, items),
    reset: () => removeKey(key),
    isOverridden: () => localStorage.getItem(PREFIX + key) !== null,
  }
}

/** 生成唯一 id */
export function uid(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}

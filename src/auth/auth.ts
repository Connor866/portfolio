/**
 * 本地登录态（纯前端演示用）
 *
 * 说明：项目要求不引入后端，因此账号密码写在代码里，登录成功后仅在
 * localStorage 中记录一个 token。它只能用于「防止误入后台」这一层演示，
 * 不具备真实的安全性，也不应承载任何敏感数据。
 */
import { readJSON, removeKey, uid, writeJSON } from '../api/storage'

const TOKEN_KEY = 'token'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'

export interface Session {
  username: string
  loginAt: number
  token: string
}

/** 登录：校验账号密码，成功则写入本地会话 */
export function login(username: string, password: string): { ok: boolean; message?: string } {
  if (!username.trim() || !password) {
    return { ok: false, message: '请输入账号和密码' }
  }
  if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return { ok: false, message: '账号或密码错误' }
  }

  const session: Session = {
    username: ADMIN_USERNAME,
    loginAt: Date.now(),
    token: uid('tk'),
  }
  writeJSON<Session>(TOKEN_KEY, session)
  return { ok: true }
}

/** 退出登录 */
export function logout(): void {
  removeKey(TOKEN_KEY)
}

/** 读取当前会话 */
export function getSession(): Session | null {
  const session = readJSON<Session | null>(TOKEN_KEY, null)
  return session && session.token ? session : null
}

/** 是否已登录 */
export function isLoggedIn(): boolean {
  return getSession() !== null
}

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isLoggedIn, login } from '../../auth/auth'
import { showToast } from '../../components/Toast'

export function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isLoggedIn()) navigate('/admin', { replace: true })
  }, [navigate])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const result = login(username, password)
    if (!result.ok) {
      setError(result.message ?? '登录失败')
      return
    }

    showToast('登录成功')
    navigate('/admin', { replace: true })
  }

  return (
    <div className="grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-xs text-dim transition-colors hover:text-ink">
          ← 返回网站
        </Link>

        <div className="glass-card mt-6 p-7">
          <h1 className="text-xl font-bold tracking-tight text-ink">管理员登录</h1>
          <p className="mt-1.5 text-xs leading-5 text-dim">
            登录后可修改前台展示的个人信息、技能、项目与文章。
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="username" className="field-label">
                账号
              </label>
              <input
                id="username"
                name="username"
                className="field"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="admin"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="field pr-16"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[11px] text-dim transition-colors hover:text-ink"
                >
                  {showPassword ? '隐藏' : '显示'}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-xs text-red-300">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full">
              登录
            </button>
          </form>

          <div className="mt-5 rounded-lg border border-line bg-white/5 px-3.5 py-3 text-[11px] leading-5 text-dim">
            演示账号：<span className="text-ink">admin</span>
            <br />
            演示密码：<span className="text-ink">admin123</span>
          </div>
        </div>
      </div>
    </div>
  )
}

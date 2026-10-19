import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { isLoggedIn, logout } from '../../auth/auth'

const NAV_ITEMS = [
  { to: '/admin', label: '概览', end: true },
  { to: '/admin/profile', label: '个人信息', end: false },
  { to: '/admin/skills', label: '技能管理', end: false },
  { to: '/admin/projects', label: '项目管理', end: false },
  { to: '/admin/posts', label: '文章管理', end: false },
  { to: '/admin/settings', label: '站点设置', end: false },
]

export function AdminLayout() {
  const navigate = useNavigate()

  if (!isLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <aside className="lg:w-56 lg:shrink-0">
          <div className="flex items-center justify-between gap-3 lg:block">
            <Link to="/admin" className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand2 text-xs font-bold text-white">
                K
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">管理后台</span>
                <span className="block text-[11px] text-dim">内容管理</span>
              </span>
            </Link>

            <Link to="/" className="text-xs text-dim transition-colors hover:text-ink lg:hidden">
              查看网站 ↗
            </Link>
          </div>

          <nav className="mt-5 flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand/15 text-ink'
                      : 'text-dim hover:bg-white/5 hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-5 hidden border-t border-line pt-4 lg:block">
            <Link
              to="/"
              className="block rounded-lg px-3 py-2 text-xs text-dim transition-colors hover:bg-white/5 hover:text-ink"
            >
              查看网站 ↗
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-xs text-dim transition-colors hover:bg-white/5 hover:text-red-300"
            >
              退出登录
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-end lg:hidden">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-line px-3 py-1.5 text-xs text-dim transition-colors hover:text-red-300"
            >
              退出登录
            </button>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  )
}

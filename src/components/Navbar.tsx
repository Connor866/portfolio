import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getSettings } from '../api/settings'
import { useLocalData } from '../hooks/useLocalData'

const NAV_LINKS = [
  { to: '/#about', label: '关于' },
  { to: '/#skills', label: '技能' },
  { to: '/#projects', label: '项目' },
  { to: '/#posts', label: '文章' },
]

export function Navbar() {
  const settings = useLocalData(getSettings)
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 路由变化时收起移动端菜单
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.hash])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-line bg-night/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-wide text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand2 text-xs font-bold text-white">
            {settings.siteName.slice(0, 1) || 'K'}
          </span>
          <span className="hidden sm:inline">{settings.siteName}</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg px-3 py-2 text-sm text-dim transition-colors hover:bg-white/5 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link to="/admin" className="btn-ghost ml-2 !px-3 !py-1.5 !text-xs">
            后台管理
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink md:hidden"
        >
          <span className="sr-only">菜单</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-line bg-night/95 px-5 pb-4 pt-2 backdrop-blur-xl md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block rounded-lg px-3 py-2.5 text-sm text-dim hover:bg-white/5 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            className="mt-2 block rounded-lg bg-white/5 px-3 py-2.5 text-sm text-ink"
          >
            后台管理
          </Link>
        </div>
      )}
    </header>
  )
}

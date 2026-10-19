import { useEffect } from 'react'
import { BrowserRouter, Link, Outlet, Route, Routes } from 'react-router-dom'
import { getSettings } from './api/settings'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { Starfield } from './components/Starfield'
import { ToastHost } from './components/Toast'
import { useLocalData } from './hooks/useLocalData'
import { BlogPost } from './pages/BlogPost'
import { Home } from './pages/Home'
import { AdminLayout } from './pages/admin/AdminLayout'
import { Dashboard } from './pages/admin/Dashboard'
import { Login } from './pages/admin/Login'
import { PostsAdmin } from './pages/admin/PostsAdmin'
import { ProfileAdmin } from './pages/admin/ProfileAdmin'
import { ProjectsAdmin } from './pages/admin/ProjectsAdmin'
import { SettingsAdmin } from './pages/admin/SettingsAdmin'
import { SkillsAdmin } from './pages/admin/SkillsAdmin'

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <p className="bg-gradient-to-r from-brand to-brand2 bg-clip-text text-6xl font-bold text-transparent">
          404
        </p>
        <p className="mt-4 text-sm text-dim">这个页面不存在</p>
        <Link to="/" className="btn-ghost mt-7">
          返回首页
        </Link>
      </div>
    </div>
  )
}

/** 站点名称变化时同步浏览器标签标题 */
function DocumentTitle() {
  const settings = useLocalData(getSettings)

  useEffect(() => {
    document.title = settings.siteName
  }, [settings.siteName])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <DocumentTitle />
      <Starfield />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="blog/:slug" element={<BlogPost />} />
        </Route>

        <Route path="admin/login" element={<Login />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<ProfileAdmin />} />
          <Route path="skills" element={<SkillsAdmin />} />
          <Route path="projects" element={<ProjectsAdmin />} />
          <Route path="posts" element={<PostsAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastHost />
    </BrowserRouter>
  )
}

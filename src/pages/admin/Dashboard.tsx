import { Link } from 'react-router-dom'
import { getPosts } from '../../api/posts'
import { getProfile } from '../../api/profile'
import { getProjects } from '../../api/projects'
import { getSkills } from '../../api/skills'
import { useLocalData } from '../../hooks/useLocalData'
import { PageHeader } from './PageHeader'

const QUICK_ACTIONS = [
  { to: '/admin/profile', title: '修改个人信息', desc: '姓名、简介、头像与简历文件' },
  { to: '/admin/skills', title: '维护技能栈', desc: '增删技能、调整熟练度' },
  { to: '/admin/projects', title: '更新项目经历', desc: '项目描述、标签与跳转链接' },
  { to: '/admin/posts', title: '撰写技术文章', desc: 'Markdown 编辑与实时预览' },
]

export function Dashboard() {
  const profile = useLocalData(getProfile)
  const skills = useLocalData(getSkills)
  const projects = useLocalData(getProjects)
  const posts = useLocalData(getPosts)

  const stats = [
    { label: '技能条目', value: skills.length, to: '/admin/skills' },
    { label: '项目经历', value: projects.length, to: '/admin/projects' },
    { label: '技术文章', value: posts.length, to: '/admin/posts' },
  ]

  return (
    <div className="space-y-7">
      <PageHeader title="概览" description={`当前展示：${profile.name} · ${profile.title}`} />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="glass-card p-5 transition-colors hover:border-brand/40"
          >
            <p className="text-[11px] text-dim">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-ink">{stat.value}</p>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-ink">快捷操作</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="glass-card group p-4 transition-colors hover:border-brand/40"
            >
              <p className="flex items-center justify-between text-sm font-medium text-ink">
                {action.title}
                <span className="text-dim transition-transform group-hover:translate-x-0.5">→</span>
              </p>
              <p className="mt-1 text-xs text-dim">{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-line bg-white/[0.03] p-5 text-xs leading-6 text-dim">
        <p className="font-medium text-slate-300">数据存放说明</p>
        <p className="mt-2">
          所有修改保存在当前浏览器的 localStorage 与 IndexedDB 中，刷新页面不会丢失；清除浏览器数据或更换设备后会恢复为代码内置的默认内容。整个站点为纯前端实现，部署到 Cloudflare Pages 后同样按此规则工作。
        </p>
      </div>
    </div>
  )
}

import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getPosts } from '../api/posts'
import { getProfile } from '../api/profile'
import { getProjects } from '../api/projects'
import { getSkills } from '../api/skills'
import { Reveal } from '../components/Reveal'
import { useFileUrl } from '../hooks/useFileUrl'
import { useLocalData } from '../hooks/useLocalData'

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <Reveal>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand2">{eyebrow}</p>
      <h2 className="section-title mt-2">{title}</h2>
      {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-dim">{description}</p>}
    </Reveal>
  )
}

export function Home() {
  const profile = useLocalData(getProfile)
  const skills = useLocalData(getSkills)
  const projects = useLocalData(getProjects)
  const posts = useLocalData(getPosts)

  const avatarUrl = useFileUrl(profile.avatarFileName)
  const resumeUrl = useFileUrl(profile.resumeFileName)

  const location = useLocation()

  // 从其它页面跳回 /#anchor 时滚动到对应区块
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [location.hash])

  const categories = Array.from(new Set(skills.map((skill) => skill.category)))

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section id="home" className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px]" />

        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 md:grid-cols-[1.35fr_1fr] md:pt-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-1 text-[11px] text-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              大连海事大学 · 计算机科学与技术
            </p>

            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              你好，我是{' '}
              <span className="bg-gradient-to-r from-brand to-brand2 bg-clip-text text-transparent">
                {profile.name}
              </span>
            </h1>

            <p className="mt-4 text-base text-slate-300 sm:text-lg">{profile.title}</p>
            <p className="mt-5 max-w-xl text-sm leading-7 text-dim sm:text-base">{profile.tagline}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#projects" className="btn-primary">
                查看项目
              </a>
              {resumeUrl ? (
                <a href={resumeUrl} download={profile.resumeFileName || 'resume.pdf'} className="btn-ghost">
                  下载简历
                </a>
              ) : (
                <span className="btn-ghost cursor-not-allowed opacity-50" title="请在后台「个人信息」中上传简历">
                  简历待上传
                </span>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-dim">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-brand2">◇</span>
                {profile.location}
              </span>
              <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-ink">
                <span className="text-brand2">◇</span>
                {profile.email}
              </a>
            </div>
          </div>

          <Reveal delay={120} className="justify-self-center">
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-full bg-gradient-to-br from-brand/40 to-brand2/30 blur-2xl" />
              <div className="grid h-52 w-52 place-items-center overflow-hidden rounded-full border border-white/15 bg-panel/70 sm:h-64 sm:w-64">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={`${profile.name} 的头像`} className="h-full w-full object-cover" />
                ) : (
                  <span className="bg-gradient-to-br from-brand to-brand2 bg-clip-text text-7xl font-bold text-transparent">
                    {profile.name.slice(0, 1)}
                  </span>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 关于 ---------------- */}
      <section id="about" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <SectionHeading eyebrow="About" title="关于我" />

        <div className="mt-8 grid gap-5 md:grid-cols-[1.35fr_1fr]">
          <Reveal>
            <div className="glass-card h-full p-6 sm:p-7">
              <p className="text-sm leading-7 text-slate-300">{profile.bio}</p>

              {profile.socials.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {profile.socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target={social.url.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/5 px-3.5 py-1.5 text-xs text-slate-300 transition-colors hover:border-brand/50 hover:text-ink"
                    >
                      {social.label}
                      <span className="text-dim">↗</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="glass-card h-full p-6 sm:p-7">
              <h3 className="text-sm font-semibold text-ink">教育背景</h3>
              <ul className="mt-5 space-y-5">
                {profile.education.map((item) => (
                  <li key={item.id} className="border-l border-line pl-4">
                    <p className="text-[11px] tracking-wide text-dim">{item.time}</p>
                    <p className="mt-1 text-sm font-medium text-ink">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {profile.timeline.length > 0 && (
          <div className="mt-10">
            <Reveal>
              <h3 className="text-sm font-semibold text-ink">成长轨迹</h3>
            </Reveal>
            <ol className="mt-5 space-y-5">
              {profile.timeline.map((item, index) => (
                <li key={item.id}>
                  <Reveal delay={index * 70}>
                    <div className="relative pl-7">
                      <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-brand bg-night" />
                      {index < profile.timeline.length - 1 && (
                        <span className="absolute left-[4px] top-4 h-full w-px bg-line" />
                      )}
                      <p className="text-[11px] tracking-wide text-dim">{item.time}</p>
                      <p className="mt-1 text-sm font-medium text-ink">{item.title}</p>
                      <p className="mt-1 max-w-2xl text-xs leading-6 text-slate-400">{item.description}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* ---------------- 技能 ---------------- */}
      <section id="skills" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <SectionHeading eyebrow="Skills" title="技能栈" description="按方向整理的技术栈与自我评估，持续更新中。" />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {categories.map((category, index) => (
            <Reveal key={category} delay={index * 80}>
              <div className="glass-card h-full p-6">
                <h3 className="text-sm font-semibold text-ink">{category}</h3>
                <ul className="mt-5 space-y-4">
                  {skills
                    .filter((skill) => skill.category === category)
                    .map((skill) => (
                      <li key={skill.id}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">{skill.name}</span>
                          <span className="tabular-nums text-dim">{skill.level}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand to-brand2 transition-[width] duration-700"
                            style={{ width: `${Math.max(0, Math.min(100, skill.level))}%` }}
                          />
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- 项目 ---------------- */}
      <section id="projects" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <SectionHeading eyebrow="Projects" title="项目经历" description="课程作业与独立实践，包含完整的开发、调试与部署过程。" />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={index * 70}>
              <article className="glass-card flex h-full flex-col p-6 transition-colors duration-300 hover:border-brand/40">
                {project.cover && (
                  <img
                    src={project.cover}
                    alt={`${project.title} 封面`}
                    loading="lazy"
                    className="mb-4 aspect-video w-full rounded-lg border border-line object-cover"
                  />
                )}

                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-semibold text-ink">{project.title}</h3>
                  <span className="shrink-0 text-[11px] text-dim">{project.date}</span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-300">{project.summary}</p>
                <p className="mt-2 text-xs leading-6 text-slate-500">{project.description}</p>

                <div className="mt-auto pt-5">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-line bg-white/5 px-2.5 py-0.5 text-[11px] text-dim"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand transition-colors hover:text-brand2"
                    >
                      查看项目
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- 文章 ---------------- */}
      <section id="posts" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <SectionHeading eyebrow="Writing" title="技术文章" description="开发过程中踩过的坑与思考，用 Markdown 记录。" />

        <div className="mt-8 space-y-3">
          {posts.map((post, index) => (
            <Reveal key={post.id} delay={index * 60}>
              <Link
                to={`/blog/${post.slug}`}
                className="glass-card group flex flex-col gap-2 p-5 transition-colors duration-300 hover:border-brand/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-brand">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-1 text-xs text-dim">{post.summary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-[11px] text-dim">
                  <span>{post.date}</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- 联系 ---------------- */}
      <section className="mx-auto max-w-6xl px-5 pb-8 pt-10 sm:px-8">
        <Reveal>
          <div className="glass-card relative overflow-hidden p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand/10 via-transparent to-brand2/10" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">想聊聊？</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-dim">
              欢迎交流前端、浏览器扩展、AI 辅助编程，或者任何有意思的项目想法。
            </p>
            <a href={`mailto:${profile.email}`} className="btn-primary mt-7">
              发邮件给我
            </a>
          </div>
        </Reveal>
      </section>
    </>
  )
}

import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import { getPosts } from '../api/posts'
import { useLocalData } from '../hooks/useLocalData'

export function BlogPost() {
  const { slug = '' } = useParams<{ slug: string }>()
  const posts = useLocalData(getPosts)
  const post = posts.find((item) => item.slug === slug)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [slug])

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-28 text-center sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand2">404</p>
        <h1 className="mt-3 text-2xl font-bold">这篇文章不存在</h1>
        <p className="mt-3 text-sm text-dim">它可能被删除了，或者链接拼写有误。</p>
        <Link to="/" className="btn-ghost mt-8">
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl px-5 pb-20 pt-14 sm:px-8">
      <Link to="/#posts" className="text-xs text-dim transition-colors hover:text-ink">
        ← 返回文章列表
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs text-dim">
          <span>{post.date}</span>
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-line bg-white/5 px-2.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="markdown-body mt-10">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <footer className="mt-14 border-t border-line pt-6">
        <Link to="/#posts" className="text-xs font-medium text-brand transition-colors hover:text-brand2">
          ← 返回文章列表
        </Link>
      </footer>
    </article>
  )
}

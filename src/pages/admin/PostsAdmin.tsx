import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { getPosts, resetPosts, savePosts } from '../../api/posts'
import { uid } from '../../api/storage'
import { showToast } from '../../components/Toast'
import type { Post } from '../../types'
import { PageHeader } from './PageHeader'

function today(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`
}

export function PostsAdmin() {
  const [items, setItems] = useState<Post[]>(() => getPosts())
  const [activeId, setActiveId] = useState<string | null>(() => getPosts()[0]?.id ?? null)
  const [tagTexts, setTagTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(getPosts().map((item) => [item.id, item.tags.join(', ')])),
  )
  const [showPreview, setShowPreview] = useState(true)
  const [saving, setSaving] = useState(false)

  const active = items.find((item) => item.id === activeId) ?? null

  function updateActive(patch: Partial<Post>) {
    if (!activeId) return
    setItems((prev) => prev.map((item) => (item.id === activeId ? { ...item, ...patch } : item)))
  }

  function add() {
    const id = uid('po')
    const post: Post = {
      id,
      slug: `post-${Date.now().toString(36)}`,
      title: '',
      summary: '',
      tags: [],
      date: today(),
      content: '',
    }
    setItems((prev) => [post, ...prev])
    setTagTexts((prev) => ({ ...prev, [id]: '' }))
    setActiveId(id)
  }

  function remove(id: string) {
    if (!window.confirm('确定删除这篇文章吗？')) return
    const rest = items.filter((item) => item.id !== id)
    setItems(rest)
    setTagTexts((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    if (activeId === id) {
      setActiveId(rest[0]?.id ?? null)
    }
  }

  function handleSave() {
    if (items.some((item) => !item.title.trim() || !item.slug.trim() || !item.content.trim())) {
      showToast('标题、slug 与正文不能为空', 'error')
      return
    }

    const slugs = items.map((item) => item.slug.trim())
    if (new Set(slugs).size !== slugs.length) {
      showToast('文章 slug 不能重复', 'error')
      return
    }

    setSaving(true)
    const normalized = items.map((item) => ({
      ...item,
      title: item.title.trim(),
      slug: item.slug.trim().replace(/\s+/g, '-').toLowerCase(),
      summary: item.summary.trim(),
      tags: (tagTexts[item.id] ?? '')
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    }))

    savePosts(normalized)
    setItems(normalized)
    setSaving(false)
    showToast('文章已保存')
  }

  function handleReset() {
    if (!window.confirm('确定恢复默认文章吗？本地修改将被清除。')) return
    resetPosts()
    const fresh = getPosts()
    setItems(fresh)
    setTagTexts(Object.fromEntries(fresh.map((item) => [item.id, item.tags.join(', ')])))
    setActiveId(fresh[0]?.id ?? null)
    showToast('已恢复默认文章')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="文章管理"
        description="正文使用 Markdown 编写，右侧（或下方）为实时预览。"
        actions={
          <>
            <button type="button" onClick={handleReset} className="text-xs text-dim hover:text-red-300">
              恢复默认
            </button>
            <button type="button" onClick={handleSave} className="btn-primary !px-4 !py-1.5 !text-xs" disabled={saving}>
              {saving ? '保存中…' : '保存全部'}
            </button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
        {/* 文章列表 */}
        <aside className="glass-card h-fit p-3">
          <button type="button" onClick={add} className="btn-ghost w-full !px-3 !py-2 !text-xs">
            + 新建文章
          </button>

          <ul className="mt-3 space-y-1">
            {items.length === 0 && <li className="px-2 py-4 text-center text-[11px] text-dim">暂无文章</li>}

            {items.map((post) => (
              <li key={post.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(post.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    activeId === post.id
                      ? 'bg-brand/15 text-ink'
                      : 'text-dim hover:bg-white/5 hover:text-ink'
                  }`}
                >
                  <span className="block truncate">{post.title || '未命名文章'}</span>
                  <span className="mt-0.5 block text-[10px] text-dim">{post.date}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* 编辑器 */}
        <section className="min-w-0">
          {!active ? (
            <div className="glass-card p-10 text-center text-xs text-dim">
              选择左侧文章开始编辑，或点击「新建文章」。
            </div>
          ) : (
            <div className="glass-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <h2 className="truncate text-sm font-semibold text-ink">
                  {active.title || '未命名文章'}
                </h2>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview((value) => !value)}
                    className="rounded-lg border border-line px-2.5 py-1 text-[11px] text-dim transition-colors hover:text-ink"
                  >
                    {showPreview ? '隐藏预览' : '显示预览'}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(active.id)}
                    className="text-[11px] text-dim transition-colors hover:text-red-300"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="field-label">标题</span>
                  <input
                    className="field"
                    value={active.title}
                    onChange={(event) => updateActive({ title: event.target.value })}
                    placeholder="文章标题"
                  />
                </label>

                <label className="block">
                  <span className="field-label">slug（URL 路径）</span>
                  <input
                    className="field font-mono !text-xs"
                    value={active.slug}
                    onChange={(event) => updateActive({ slug: event.target.value })}
                    placeholder="chrome-manifest-v3-notes"
                  />
                </label>

                <label className="block">
                  <span className="field-label">日期</span>
                  <input
                    className="field"
                    value={active.date}
                    onChange={(event) => updateActive({ date: event.target.value })}
                    placeholder="2026.10.19"
                  />
                </label>

                <label className="block">
                  <span className="field-label">标签（逗号分隔）</span>
                  <input
                    className="field"
                    value={tagTexts[active.id] ?? ''}
                    onChange={(event) =>
                      setTagTexts((prev) => ({ ...prev, [active.id]: event.target.value }))
                    }
                    placeholder="React, 工程实践"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="field-label">摘要（列表页展示）</span>
                  <textarea
                    className="field resize-y"
                    rows={2}
                    value={active.summary}
                    onChange={(event) => updateActive({ summary: event.target.value })}
                  />
                </label>
              </div>

              <div className={`mt-4 grid gap-3 ${showPreview ? 'lg:grid-cols-2' : ''}`}>
                <label className="block">
                  <span className="field-label">正文（Markdown）</span>
                  <textarea
                    className="field min-h-[420px] resize-y font-mono !text-[13px] !leading-6"
                    value={active.content}
                    onChange={(event) => updateActive({ content: event.target.value })}
                    placeholder={'## 小标题\n\n正文内容，支持 **加粗**、`代码`、列表和代码块。'}
                    spellCheck={false}
                  />
                </label>

                {showPreview && (
                  <div>
                    <span className="field-label">预览</span>
                    <div className="max-h-[560px] min-h-[420px] overflow-auto rounded-xl border border-line bg-white/[0.02] p-4">
                      {active.content.trim() ? (
                        <div className="markdown-body">
                          <ReactMarkdown>{active.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-xs text-dim">开始输入正文后，这里会显示渲染结果。</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

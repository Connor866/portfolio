import { useState } from 'react'
import { getProjects, resetProjects, saveProjects } from '../../api/projects'
import { uid } from '../../api/storage'
import { showToast } from '../../components/Toast'
import type { Project } from '../../types'
import { PageHeader } from './PageHeader'

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function ProjectsAdmin() {
  const [items, setItems] = useState<Project[]>(() => getProjects())
  // 标签单独保存文本，避免输入逗号时被即时解析掉
  const [tagTexts, setTagTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(getProjects().map((item) => [item.id, item.tags.join(', ')])),
  )
  const [saving, setSaving] = useState(false)

  function update(index: number, patch: Partial<Project>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function add() {
    const id = uid('pj')
    setItems((prev) => [
      ...prev,
      {
        id,
        title: '',
        summary: '',
        description: '',
        tags: [],
        cover: '',
        link: '',
        date: currentMonth(),
      },
    ])
    setTagTexts((prev) => ({ ...prev, [id]: '' }))
  }

  function remove(id: string) {
    if (!window.confirm('确定删除这个项目吗？')) return
    setItems((prev) => prev.filter((item) => item.id !== id))
    setTagTexts((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function handleSave() {
    if (items.some((item) => !item.title.trim())) {
      showToast('项目名称不能为空', 'error')
      return
    }

    setSaving(true)
    const normalized = items.map((item) => ({
      ...item,
      title: item.title.trim(),
      summary: item.summary.trim(),
      description: item.description.trim(),
      tags: (tagTexts[item.id] ?? '')
        .split(/[,，]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    }))

    saveProjects(normalized)
    setItems(normalized)
    setSaving(false)
    showToast('项目经历已保存')
  }

  function handleReset() {
    if (!window.confirm('确定恢复默认项目经历吗？本地修改将被清除。')) return
    resetProjects()
    const fresh = getProjects()
    setItems(fresh)
    setTagTexts(Object.fromEntries(fresh.map((item) => [item.id, item.tags.join(', ')])))
    showToast('已恢复默认项目')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="项目管理"
        description="维护首页项目经历卡片，标签用逗号分隔。"
        actions={
          <>
            <button type="button" onClick={handleReset} className="text-xs text-dim hover:text-red-300">
              恢复默认
            </button>
            <button type="button" onClick={add} className="btn-ghost !px-3 !py-1.5 !text-xs">
              + 新增项目
            </button>
            <button type="button" onClick={handleSave} className="btn-primary !px-4 !py-1.5 !text-xs" disabled={saving}>
              {saving ? '保存中…' : '保存'}
            </button>
          </>
        }
      />

      {items.length === 0 && (
        <div className="glass-card p-8 text-center text-xs text-dim">暂无项目，点击「新增项目」开始。</div>
      )}

      {items.map((item, index) => (
        <article key={item.id} className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
            <h2 className="truncate text-sm font-semibold text-ink">{item.title || '未命名项目'}</h2>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="shrink-0 text-[11px] text-dim transition-colors hover:text-red-300"
            >
              删除
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="field-label">项目名称</span>
              <input
                className="field"
                value={item.title}
                onChange={(event) => update(index, { title: event.target.value })}
                placeholder="如 电商图片提取下载插件"
              />
            </label>

            <label className="block">
              <span className="field-label">时间</span>
              <input
                className="field"
                value={item.date}
                onChange={(event) => update(index, { date: event.target.value })}
                placeholder="2026.10"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="field-label">一句话简介（卡片主文案）</span>
              <textarea
                className="field resize-y"
                rows={2}
                value={item.summary}
                onChange={(event) => update(index, { summary: event.target.value })}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="field-label">详细描述</span>
              <textarea
                className="field resize-y"
                rows={3}
                value={item.description}
                onChange={(event) => update(index, { description: event.target.value })}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="field-label">技术标签（逗号分隔）</span>
              <input
                className="field"
                value={tagTexts[item.id] ?? ''}
                onChange={(event) =>
                  setTagTexts((prev) => ({ ...prev, [item.id]: event.target.value }))
                }
                placeholder="React, TypeScript, Tailwind CSS"
              />
            </label>

            <label className="block">
              <span className="field-label">项目链接（可选）</span>
              <input
                className="field"
                value={item.link}
                onChange={(event) => update(index, { link: event.target.value })}
                placeholder="https://..."
              />
            </label>

            <label className="block">
              <span className="field-label">封面图 URL（可选）</span>
              <input
                className="field"
                value={item.cover}
                onChange={(event) => update(index, { cover: event.target.value })}
                placeholder="https://.../cover.png"
              />
            </label>
          </div>
        </article>
      ))}
    </div>
  )
}

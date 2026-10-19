import { useState } from 'react'
import { getSkills, resetSkills, saveSkills } from '../../api/skills'
import { uid } from '../../api/storage'
import { showToast } from '../../components/Toast'
import type { Skill } from '../../types'
import { PageHeader } from './PageHeader'

export function SkillsAdmin() {
  const [items, setItems] = useState<Skill[]>(() => getSkills())
  const [saving, setSaving] = useState(false)

  const categories = Array.from(new Set(items.map((item) => item.category))).filter(Boolean)

  function update(index: number, patch: Partial<Skill>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function add() {
    setItems((prev) => [
      ...prev,
      { id: uid('sk'), category: categories[0] ?? '前端', name: '', level: 70 },
    ])
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    if (items.some((item) => !item.name.trim() || !item.category.trim())) {
      showToast('技能名称和分类不能为空', 'error')
      return
    }

    setSaving(true)
    const normalized = items.map((item) => ({
      ...item,
      name: item.name.trim(),
      category: item.category.trim(),
      level: Math.max(0, Math.min(100, Math.round(item.level))),
    }))
    saveSkills(normalized)
    setItems(normalized)
    setSaving(false)
    showToast('技能列表已保存')
  }

  function handleReset() {
    if (!window.confirm('确定恢复默认技能列表吗？本地修改将被清除。')) return
    resetSkills()
    setItems(getSkills())
    showToast('已恢复默认技能')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="技能管理"
        description="按分类维护技能条目，熟练度会显示为前台的进度条。"
        actions={
          <>
            <button type="button" onClick={handleReset} className="text-xs text-dim hover:text-red-300">
              恢复默认
            </button>
            <button type="button" onClick={add} className="btn-ghost !px-3 !py-1.5 !text-xs">
              + 新增技能
            </button>
            <button type="button" onClick={handleSave} className="btn-primary !px-4 !py-1.5 !text-xs" disabled={saving}>
              {saving ? '保存中…' : '保存'}
            </button>
          </>
        }
      />

      <div className="glass-card p-4 sm:p-5">
        <div className="hidden gap-3 px-1 pb-3 text-[11px] text-dim sm:grid sm:grid-cols-[1.2fr_1fr_12rem_2.5rem]">
          <span>技能名称</span>
          <span>分类</span>
          <span>熟练度</span>
          <span />
        </div>

        <div className="space-y-2">
          {items.length === 0 && <p className="py-6 text-center text-xs text-dim">暂无技能，点击「新增技能」添加。</p>}

          {items.map((item, index) => (
            <div
              key={item.id}
              className="grid items-center gap-2 rounded-lg border border-line bg-white/[0.02] p-3 sm:grid-cols-[1.2fr_1fr_12rem_2.5rem] sm:border-transparent sm:bg-transparent sm:p-1"
            >
              <input
                className="field"
                value={item.name}
                onChange={(event) => update(index, { name: event.target.value })}
                placeholder="如 React"
                aria-label="技能名称"
              />

              <input
                className="field"
                value={item.category}
                onChange={(event) => update(index, { category: event.target.value })}
                list="skill-categories"
                placeholder="如 前端"
                aria-label="技能分类"
              />

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={item.level}
                  onChange={(event) => update(index, { level: Number(event.target.value) })}
                  className="h-1.5 w-full cursor-pointer accent-[#6a5cff]"
                  aria-label={`${item.name || '技能'}熟练度`}
                />
                <span className="w-9 shrink-0 text-right text-xs tabular-nums text-dim">
                  {item.level}
                </span>
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="justify-self-end rounded-lg px-2 py-1 text-xs text-dim transition-colors hover:text-red-300"
                aria-label={`删除 ${item.name || '该技能'}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <datalist id="skill-categories">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </div>

      <p className="text-[11px] leading-5 text-dim">
        提示：分类名称相同的技能会自动归到前台同一张卡片里，建议复用已有分类。
      </p>
    </div>
  )
}

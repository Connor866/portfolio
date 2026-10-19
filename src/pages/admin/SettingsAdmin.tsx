import { useState, type FormEvent } from 'react'
import { getSettings, resetSettings, saveSettings } from '../../api/settings'
import { showToast } from '../../components/Toast'
import type { SiteSettings } from '../../types'
import { PageHeader } from './PageHeader'

export function SettingsAdmin() {
  const [draft, setDraft] = useState<SiteSettings>(() => getSettings())
  const [saving, setSaving] = useState(false)

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    saveSettings({
      siteName: draft.siteName.trim() || '个人作品集',
      footerText: draft.footerText.trim(),
    })
    setSaving(false)
    showToast('站点设置已保存')
  }

  function handleReset() {
    if (!window.confirm('确定恢复默认站点设置吗？')) return
    resetSettings()
    setDraft(getSettings())
    showToast('已恢复默认设置')
  }

  function handleClearAll() {
    const confirmed = window.confirm(
      '这会清除本浏览器内的所有修改（个人信息、技能、项目、文章、头像与简历、登录状态），并恢复为代码内置的默认内容。确定继续吗？',
    )
    if (!confirmed) return

    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('kp.')) localStorage.removeItem(key)
    }

    try {
      indexedDB.deleteDatabase('kp-files')
    } catch {
      /* 忽略 */
    }

    window.location.href = '/'
  }

  return (
    <div className="space-y-6">
      <PageHeader title="站点设置" description="影响导航与页脚展示的基础配置。" />

      <form onSubmit={handleSave} className="space-y-6">
        <section className="glass-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-ink">基础信息</h2>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="field-label">站点名称（导航栏与浏览器标签）</span>
              <input
                className="field"
                value={draft.siteName}
                onChange={(event) => setDraft({ ...draft, siteName: event.target.value })}
                placeholder="赵康 · 个人作品集"
              />
            </label>

            <label className="block">
              <span className="field-label">页脚文案</span>
              <input
                className="field"
                value={draft.footerText}
                onChange={(event) => setDraft({ ...draft, footerText: event.target.value })}
                placeholder="用 React + TypeScript 构建 · Cloudflare Pages 部署"
              />
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
            <button type="button" onClick={handleReset} className="text-xs text-dim hover:text-red-300">
              恢复默认设置
            </button>
            <button type="submit" className="btn-primary !px-5 !py-2 !text-xs" disabled={saving}>
              {saving ? '保存中…' : '保存设置'}
            </button>
          </div>
        </section>
      </form>

      <section className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-5">
        <h2 className="text-sm font-semibold text-red-200">危险操作</h2>
        <p className="mt-2 text-xs leading-6 text-red-200/70">
          清除当前浏览器内的全部本地数据，包括已上传的头像和简历。此操作不可撤销，页面会自动刷新。
        </p>
        <button
          type="button"
          onClick={handleClearAll}
          className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3.5 py-2 text-xs font-medium text-red-200 transition-colors hover:bg-red-500/20"
        >
          清除全部本地数据
        </button>
      </section>
    </div>
  )
}

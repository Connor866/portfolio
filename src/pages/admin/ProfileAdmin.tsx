import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  AVATAR_MAX_BYTES,
  RESUME_MAX_BYTES,
  removeFileQuietly,
  saveAvatar,
  saveResume,
} from '../../api/files'
import { getProfile, resetProfile, saveProfile } from '../../api/profile'
import { uid } from '../../api/storage'
import { showToast } from '../../components/Toast'
import { useFileUrl } from '../../hooks/useFileUrl'
import type { Profile, SocialLink, TimelineItem } from '../../types'
import { PageHeader } from './PageHeader'

interface TimelineEditorProps {
  label: string
  items: TimelineItem[]
  onChange: (items: TimelineItem[]) => void
}

function TimelineEditor({ label, items, onChange }: TimelineEditorProps) {
  const update = (index: number, key: keyof TimelineItem, value: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  const add = () => {
    onChange([...items, { id: uid('tl'), time: '', title: '', description: '' }])
  }

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">{label}</h2>
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-line px-2.5 py-1 text-[11px] text-dim transition-colors hover:border-brand/50 hover:text-ink"
        >
          + 添加
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {items.length === 0 && <p className="text-xs text-dim">暂无条目，点击「添加」新建一条。</p>}

        {items.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">时间</span>
                <input
                  className="field"
                  value={item.time}
                  onChange={(event) => update(index, 'time', event.target.value)}
                  placeholder="2023.09 — 至今"
                />
              </label>
              <label className="block">
                <span className="field-label">标题</span>
                <input
                  className="field"
                  value={item.title}
                  onChange={(event) => update(index, 'title', event.target.value)}
                  placeholder="学校 / 公司 / 阶段名称"
                />
              </label>
            </div>

            <label className="mt-3 block">
              <span className="field-label">描述</span>
              <textarea
                className="field min-h-20 resize-y"
                rows={2}
                value={item.description}
                onChange={(event) => update(index, 'description', event.target.value)}
                placeholder="一句话说明这段经历"
              />
            </label>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-[11px] text-dim transition-colors hover:text-red-300"
              >
                删除该条
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ProfileAdmin() {
  const [draft, setDraft] = useState<Profile>(() => getProfile())
  const [baseline, setBaseline] = useState(() => JSON.stringify(getProfile()))
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null)
  const [pendingResume, setPendingResume] = useState<File | null>(null)
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const savedAvatarUrl = useFileUrl(draft.avatarFileName)
  const savedResumeUrl = useFileUrl(draft.resumeFileName)

  // 新选头像的本地预览
  useEffect(() => {
    if (!pendingAvatar) {
      setPendingAvatarUrl(null)
      return
    }
    const url = URL.createObjectURL(pendingAvatar)
    setPendingAvatarUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingAvatar])

  const dirty =
    JSON.stringify(draft) !== baseline || pendingAvatar !== null || pendingResume !== null

  function setField<K extends keyof Profile>(key: K, value: Profile[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function updateSocial(index: number, key: keyof SocialLink, value: string) {
    setDraft((prev) => ({
      ...prev,
      socials: prev.socials.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }))
  }

  function addSocial() {
    setDraft((prev) => ({ ...prev, socials: [...prev.socials, { label: '', url: '' }] }))
  }

  function removeSocial(index: number) {
    setDraft((prev) => ({ ...prev, socials: prev.socials.filter((_, i) => i !== index) }))
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'error')
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      showToast('头像不能超过 5MB', 'error')
      return
    }
    setPendingAvatar(file)
  }

  function handleResumeChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > RESUME_MAX_BYTES) {
      showToast('简历不能超过 10MB', 'error')
      return
    }
    setPendingResume(file)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    setSaving(true)
    try {
      const next: Profile = { ...draft }

      if (pendingAvatar) {
        const oldName = next.avatarFileName
        next.avatarFileName = await saveAvatar(pendingAvatar)
        if (oldName) await removeFileQuietly(oldName)
      }

      if (pendingResume) {
        const oldName = next.resumeFileName
        next.resumeFileName = await saveResume(pendingResume)
        if (oldName) await removeFileQuietly(oldName)
      }

      saveProfile(next)
      setDraft(next)
      setBaseline(JSON.stringify(next))
      setPendingAvatar(null)
      setPendingResume(null)
      showToast('个人信息已保存')
    } catch {
      showToast('保存失败，请重试', 'error')
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    const confirmed = window.confirm('确定恢复默认个人信息吗？本地修改、已上传的头像与简历都会被清除。')
    if (!confirmed) return

    const oldAvatar = draft.avatarFileName
    const oldResume = draft.resumeFileName

    resetProfile()
    void removeFileQuietly(oldAvatar)
    void removeFileQuietly(oldResume)

    const fresh = getProfile()
    setDraft(fresh)
    setBaseline(JSON.stringify(fresh))
    setPendingAvatar(null)
    setPendingResume(null)
    showToast('已恢复默认信息')
  }

  const avatarPreview = pendingAvatarUrl ?? savedAvatarUrl

  return (
    <div className="space-y-6">
      <PageHeader
        title="个人信息"
        description="修改后会立即同步到前台；头像与简历以文件形式保存在浏览器本地。"
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* 基本信息 */}
        <section className="glass-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-ink">基本信息</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="field-label">姓名</span>
              <input
                className="field"
                value={draft.name}
                onChange={(event) => setField('name', event.target.value)}
                placeholder="你的名字"
              />
            </label>

            <label className="block">
              <span className="field-label">身份 / 专业</span>
              <input
                className="field"
                value={draft.title}
                onChange={(event) => setField('title', event.target.value)}
                placeholder="计算机科学与技术 · 本科在读"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="field-label">一句话简介（首页大字下方）</span>
              <input
                className="field"
                value={draft.tagline}
                onChange={(event) => setField('tagline', event.target.value)}
              />
            </label>

            <label className="block">
              <span className="field-label">所在城市</span>
              <input
                className="field"
                value={draft.location}
                onChange={(event) => setField('location', event.target.value)}
              />
            </label>

            <label className="block">
              <span className="field-label">邮箱</span>
              <input
                className="field"
                type="email"
                value={draft.email}
                onChange={(event) => setField('email', event.target.value)}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="field-label">个人简介</span>
              <textarea
                className="field min-h-28 resize-y"
                rows={5}
                value={draft.bio}
                onChange={(event) => setField('bio', event.target.value)}
              />
            </label>
          </div>
        </section>

        {/* 头像与简历 */}
        <section className="glass-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-ink">头像与简历</h2>

          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {/* 头像 */}
            <div>
              <p className="field-label">头像</p>
              <div className="flex items-center gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-panel">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="头像预览" className="h-full w-full object-cover" />
                  ) : (
                    <span className="bg-gradient-to-br from-brand to-brand2 bg-clip-text text-2xl font-bold text-transparent">
                      {draft.name.slice(0, 1) || 'K'}
                    </span>
                  )}
                </div>

                <div>
                  <label className="btn-ghost cursor-pointer !px-3 !py-1.5 !text-xs">
                    选择图片
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                  <p className="mt-2 text-[11px] leading-5 text-dim">
                    支持 JPG / PNG / WebP，5MB 以内，保存时会自动压缩到 512px。
                  </p>
                  {pendingAvatar && (
                    <p className="mt-1 text-[11px] text-emerald-300">
                      已选择：{pendingAvatar.name}（保存后生效）
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 简历 */}
            <div>
              <p className="field-label">简历文件</p>
              <div className="rounded-xl border border-line bg-white/[0.02] p-4">
                {pendingResume ? (
                  <p className="text-xs text-emerald-300">已选择：{pendingResume.name}（保存后生效）</p>
                ) : savedResumeUrl ? (
                  <a
                    href={savedResumeUrl}
                    download={draft.resumeFileName}
                    className="text-xs text-brand hover:text-brand2"
                  >
                    当前简历：{draft.resumeFileName} ↗
                  </a>
                ) : (
                  <p className="text-xs text-dim">尚未上传简历，前台会显示「简历待上传」。</p>
                )}

                <label className="btn-ghost mt-3 cursor-pointer !px-3 !py-1.5 !text-xs">
                  选择简历
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleResumeChange}
                  />
                </label>

                <p className="mt-2 text-[11px] leading-5 text-dim">支持 PDF / Word，10MB 以内。</p>
              </div>
            </div>
          </div>
        </section>

        {/* 社交链接 */}
        <section className="glass-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">社交链接</h2>
            <button
              type="button"
              onClick={addSocial}
              className="rounded-lg border border-line px-2.5 py-1 text-[11px] text-dim transition-colors hover:border-brand/50 hover:text-ink"
            >
              + 添加
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {draft.socials.length === 0 && <p className="text-xs text-dim">暂无链接。</p>}

            {draft.socials.map((social, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="field sm:w-36"
                  value={social.label}
                  onChange={(event) => updateSocial(index, 'label', event.target.value)}
                  placeholder="名称，如 GitHub"
                  aria-label="链接名称"
                />
                <input
                  className="field flex-1"
                  value={social.url}
                  onChange={(event) => updateSocial(index, 'url', event.target.value)}
                  placeholder="https://..."
                  aria-label="链接地址"
                />
                <button
                  type="button"
                  onClick={() => removeSocial(index)}
                  className="rounded-lg border border-line px-3 py-2 text-xs text-dim transition-colors hover:text-red-300"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 教育背景 */}
        <section className="glass-card p-5 sm:p-6">
          <TimelineEditor
            label="教育背景"
            items={draft.education}
            onChange={(education) => setField('education', education)}
          />
        </section>

        {/* 成长轨迹 */}
        <section className="glass-card p-5 sm:p-6">
          <TimelineEditor
            label="成长轨迹"
            items={draft.timeline}
            onChange={(timeline) => setField('timeline', timeline)}
          />
        </section>

        {/* 保存栏 */}
        <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-night/85 p-4 backdrop-blur">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-dim transition-colors hover:text-red-300"
          >
            恢复默认信息
          </button>

          <div className="flex items-center gap-3">
            {dirty && <span className="text-[11px] text-amber-300">有未保存的修改</span>}
            <button type="submit" className="btn-primary !px-5 !py-2 !text-xs" disabled={saving}>
              {saving ? '保存中…' : '保存修改'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

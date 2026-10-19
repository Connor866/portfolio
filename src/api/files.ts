/**
 * 头像 / 简历文件处理。
 * 文件本身存 IndexedDB，业务数据里只保存文件名。
 */
import { deleteFile, putFile } from './storage'

/** 头像最长边限制（像素），避免原图过大导致读取缓慢 */
const AVATAR_MAX_SIDE = 512

/** 头像大小上限 5MB */
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024
/** 简历大小上限 10MB */
export const RESUME_MAX_BYTES = 10 * 1024 * 1024

/** 把图片压缩为不超过 maxSide 的 JPEG */
async function resizeImage(file: File, maxSide: number): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return file
    }

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    })
    return blob ?? file
  } catch {
    // 某些格式（如 HEIC）浏览器无法解码，直接存原文件
    return file
  }
}

/** 保存头像，返回文件名 */
export async function saveAvatar(file: File): Promise<string> {
  const blob = await resizeImage(file, AVATAR_MAX_SIDE)
  const name = `avatar-${Date.now()}.jpg`
  await putFile(name, blob)
  return name
}

/** 保存简历，返回文件名 */
export async function saveResume(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
  const name = `resume-${Date.now()}.${ext}`
  await putFile(name, file)
  return name
}

/** 删除旧文件；失败不影响主流程 */
export async function removeFileQuietly(name: string): Promise<void> {
  if (!name) return
  try {
    await deleteFile(name)
  } catch {
    /* 忽略 */
  }
}

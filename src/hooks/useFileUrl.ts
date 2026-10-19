import { useEffect, useState } from 'react'
import { getFile } from '../api/storage'

/**
 * 从 IndexedDB 读取一个文件，返回可直接用于 <img src> / <a href> 的 objectURL。
 * 文件不存在（例如在别人的浏览器里打开站点）时返回 null，由调用方降级展示。
 */
export function useFileUrl(fileName: string): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    setUrl(null)
    if (!fileName) return

    getFile(fileName)
      .then((blob) => {
        if (cancelled || !blob) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => {
        /* 读取失败时保持 null，由调用方展示占位 */
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fileName])

  return url
}

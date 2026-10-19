import { useEffect, useState } from 'react'

type ToastKind = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  kind: ToastKind
}

const TOAST_EVENT = 'kp:toast'

/** 在任意位置调用，弹出一条轻提示 */
export function showToast(message: string, kind: ToastKind = 'success'): void {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, kind } }))
}

/** 挂在 App 根部的提示容器 */
export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; kind: ToastKind }>).detail
      const id = Date.now() + Math.random()

      setItems((prev) => [...prev, { id, message: detail.message, kind: detail.kind }])
      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id))
      }, 2600)
    }

    window.addEventListener(TOAST_EVENT, handler)
    return () => window.removeEventListener(TOAST_EVENT, handler)
  }, [])

  if (items.length === 0) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={`rounded-full border px-4 py-2 text-xs shadow-lg backdrop-blur ${
            item.kind === 'error'
              ? 'border-red-400/30 bg-red-500/15 text-red-200'
              : 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
          }`}
        >
          {item.message}
        </div>
      ))}
    </div>
  )
}

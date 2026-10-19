import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  r: number
  baseAlpha: number
  speed: number
  phase: number
}

/**
 * 全屏星空背景。
 * - 按 DevicePixelRatio 绘制，高分屏不发虚（上限 2，避免性能浪费）
 * - 手机端减少粒子数量
 * - 系统开启「减少动态效果」时只画一帧静态图
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let stars: Star[] = []
    let rafId = 0

    const build = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = width < 768 ? 70 : 150
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.45 + 0.2,
        speed: Math.random() * 0.8 + 0.2,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = (seconds: number) => {
      ctx.clearRect(0, 0, width, height)

      for (const star of stars) {
        const twinkle = reduceMotion
          ? 1
          : 0.6 + 0.4 * Math.sin(seconds * star.speed + star.phase)

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(214, 222, 240, ${(star.baseAlpha * twinkle).toFixed(3)})`
        ctx.fill()

        if (!reduceMotion) {
          star.y += star.speed * 0.06
          if (star.y > height + 2) {
            star.y = -2
            star.x = Math.random() * width
          }
        }
      }
    }

    const loop = (time: number) => {
      draw(time / 1000)
      rafId = requestAnimationFrame(loop)
    }

    const onResize = () => {
      build()
      if (reduceMotion) draw(0)
    }

    build()
    if (reduceMotion) {
      draw(0)
    } else {
      rafId = requestAnimationFrame(loop)
    }

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  )
}

import type { Post } from '../types'

/** 博客文章的静态默认值（首次访问时展示） */
export const defaultPosts: Post[] = [
  {
    id: 'po-1',
    slug: 'chrome-manifest-v3-notes',
    title: '从零写一个 Chrome 扩展：Manifest V3 的四个关键点',
    summary:
      '第一次写扩展时踩过的坑：Service Worker 为什么会休眠、消息通道怎么保活、跨域图片怎么转格式、下载 API 为什么拿不到 objectURL。',
    tags: ['Chrome 扩展', 'Manifest V3'],
    date: '2026.10.15',
    content: `做电商图片下载插件时，我把 Manifest V3 的主要坑都踩了一遍。这里记录四个最容易出问题的地方。

## 一、Service Worker 会休眠

V2 的 background 是一个常驻的后台页面，V3 换成了 Service Worker，**闲置约 30 秒后会被浏览器杀掉**。

这意味着不能把状态放在全局变量里：

\`\`\`js
// 错误：SW 重启后 list 就没了
let list = []
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'ADD') list.push(msg.item)
})
\`\`\`

正确做法是持久化到 \`chrome.storage.local\`，每次用到时重新读取。

## 二、异步响应必须 return true

如果要在回调里异步调用 \`sendResponse\`，监听函数必须返回 \`true\` 保持消息通道打开，否则通道会立刻关闭：

\`\`\`js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  doSomethingAsync().then(sendResponse)
  return true // 关键
})
\`\`\`

## 三、跨域图片要用后台 fetch

内容脚本里用 canvas 读取跨域图片会污染画布，\`toBlob\` 直接抛异常。解决办法是在 manifest 里声明 \`host_permissions\`，然后在 Service Worker 中 fetch：

\`\`\`js
const resp = await fetch(url)
const blob = await resp.blob()
const bitmap = await createImageBitmap(blob)
const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
canvas.getContext('2d').drawImage(bitmap, 0, 0)
const png = await canvas.convertToBlob({ type: 'image/png' })
\`\`\`

## 四、Service Worker 里没有 URL.createObjectURL

这是最容易卡住的一点。SW 中没有 DOM，也就没有 \`URL.createObjectURL\`。

我的方案是用 \`FileReaderSync\`（Worker 环境可用）把 Blob 转成 dataURL 回传给页面，再由页面转回 Blob 生成 objectURL 交给 \`chrome.downloads\`。

绕了一圈，但确实能跑通。`,
  },
  {
    id: 'po-2',
    slug: 'why-no-redux',
    title: '这个作品集项目，为什么我不用 Redux',
    summary:
      '状态管理库不是越重越好。这个项目只有「读数据、改数据、通知刷新」三件事，一个自定义 hook 就够了。',
    tags: ['React', '工程实践'],
    date: '2026.10.10',
    content: `很多人写 React 项目的第一反应是装 Redux 或 Zustand。但在这个作品集项目里，我最后只写了一个 30 行的 hook。

## 先问一句：状态需要跨多少组件？

这个站点的数据只有五份：个人信息、技能、项目、文章、站点设置。它们的共同点是：

- **全局只有一份**
- **改动只发生在后台**
- **前台只需要在改动后重新读一次**

没有复杂的派生状态，没有高频更新，也没有多个组件协同修改同一份数据。这种情况下引入状态管理库，等于为了一个抽屉买一整个衣柜。

## 我的方案：事件 + 自定义 hook

数据层的核心只有三件事：

\`\`\`ts
// 1. 读取（带默认值回退）
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem('kp.' + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

// 2. 写入后广播
export function writeJSON<T>(key: string, value: T) {
  localStorage.setItem('kp.' + key, JSON.stringify(value))
  window.dispatchEvent(new Event('kp:data-changed'))
}

// 3. 订阅
export function useLocalData<T>(getter: () => T): T {
  const [value, setValue] = useState(getter)
  useEffect(() => {
    const update = () => setValue(getter())
    window.addEventListener('kp:data-changed', update)
    return () => window.removeEventListener('kp:data-changed', update)
  }, [])
  return value
}
\`\`\`

后台保存时调用 \`writeJSON\`，前台所有订阅了这份数据的组件会**同时收到通知并重新渲染**。

## 什么时候才该上状态库？

我的判断标准是这三条里至少满足一条：

1. 状态有大量派生计算，且需要缓存；
2. 多个异步请求需要编排；
3. 状态更新逻辑复杂到需要单独测试。

如果都不满足，先用 useState + Context 或自定义 hook，等真的痛了再换。`,
  },
  {
    id: 'po-3',
    slug: 'canvas-starfield-performance',
    title: '用 Canvas 画一片不卡的星空',
    summary:
      '粒子系统的三个性能要点：DevicePixelRatio、按屏幕宽度降级、以及在 prefers-reduced-motion 下直接停掉动画。',
    tags: ['Canvas', '性能优化'],
    date: '2026.10.05',
    content: `作品集的背景是一片缓慢闪烁的星空。实现不难，但要做到手机端也不掉帧，有几个细节必须处理。

## 一、别忘 DevicePixelRatio

直接按 CSS 像素设置画布尺寸，在高分屏上会明显发虚：

\`\`\`ts
const dpr = Math.min(window.devicePixelRatio || 1, 2)
canvas.width = window.innerWidth * dpr
canvas.height = window.innerHeight * dpr
canvas.style.width = window.innerWidth + 'px'
canvas.style.height = window.innerHeight + 'px'
ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
\`\`\`

注意上限取 2：3 倍屏再往上加，肉眼收益很小，开销却翻倍。

## 二、按屏幕宽度降低粒子数量

手机和桌面的性能差距很大。我按宽度做了一档降级：

\`\`\`ts
const count = window.innerWidth < 768 ? 70 : 150
\`\`\`

## 三、尊重系统设置

如果用户开启了「减少动态效果」，就不该再播动画。这不是可选项，是基本的无障碍要求：

\`\`\`ts
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (reduce) {
  drawStaticStars()   // 只画一次，不进 RAF 循环
} else {
  loop()              // 正常动画
}
\`\`\`

## 四、别忘了取消 RAF

组件卸载时不调用 \`cancelAnimationFrame\`，切页面后动画仍在后台跑，白烧 CPU：

\`\`\`ts
return () => cancelAnimationFrame(rafId)
\`\`\`

这四条加起来不到 20 行代码，但直接决定了这片星空是「加分项」还是「卡顿源」。`,
  },
]

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite 配置：React + Tailwind CSS 4（通过官方 Vite 插件接入，无需 tailwind.config.js）
export default defineConfig({
  plugins: [react(), tailwindcss()],
})

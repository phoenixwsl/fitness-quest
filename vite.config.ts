import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // GitHub Pages 项目站点在 /fitness-quest/ 子路径;本地开发 / 预览仍用根路径。
  base: process.env.GITHUB_ACTIONS ? '/fitness-quest/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '健身大闯关',
        short_name: '健身大闯关',
        description: '在强直性脊柱炎安全范围内督促减脂与体态改善的本地工具',
        lang: 'zh-CN',
        theme_color: '#0d9488',
        background_color: '#ffffff',
        display: 'standalone',
        // 相对路径,在根路径与 /fitness-quest/ 子路径下都正确解析。
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})

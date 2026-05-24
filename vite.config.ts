import { defineConfig } from 'vitest/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

export default defineConfig({
  // GitHub Pages 项目站点在 /fitness-quest/ 子路径;本地开发 / 预览仍用根路径。
  base: process.env.GITHUB_ACTIONS ? '/fitness-quest/' : '/',
  // 构建时注入版本号(来自 package.json,唯一版本来源)。
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // prompt:检测到新版本时由 UI 提示「点击更新」,不再静默自动更新。
      registerType: 'prompt',
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
    // PWA 虚拟模块在测试环境不可解析,统一指向惰性 stub;
    // 需要受控行为的测试用例自行 vi.mock 覆盖。
    alias: {
      'virtual:pwa-register/react': fileURLToPath(
        new URL('./src/test/pwaRegisterStub.ts', import.meta.url),
      ),
    },
  },
})

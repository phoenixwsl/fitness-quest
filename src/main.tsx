import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// 预缓存 App Shell,实现断网冷启动可用(离线优先硬要求)。
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

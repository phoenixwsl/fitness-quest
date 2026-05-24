import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Service Worker 注册改由 <UpdatePrompt> 内的 useRegisterSW 处理(prompt 模式,
// 检测到新版本时提示「点击更新」,不再静默自动更新)。

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

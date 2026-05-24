import { useRegisterSW } from 'virtual:pwa-register/react'

// 非侵入式更新提示:检测到新版本时底部弹一条「点击更新」,不打断使用;离线时不影响。
export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl bg-slate-800 px-4 py-3 text-sm text-white shadow-lg">
      <span>有新版本可用</span>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="rounded-lg bg-teal-500 px-3 py-1.5 font-semibold"
      >
        点击更新
      </button>
    </div>
  )
}

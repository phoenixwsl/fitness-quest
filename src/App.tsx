import { useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'
import TodayPage from './pages/TodayPage'
import ProgressPlaceholder from './pages/ProgressPlaceholder'

function CheckInPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-10 pb-24 text-center">
      <h1 className="text-lg font-semibold text-slate-700">复盘</h1>
      <p className="text-sm text-slate-400">每晚一次的复盘打卡即将上线。</p>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('today')

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-800">
      <main className="mx-auto max-w-md">
        {tab === 'today' && <TodayPage />}
        {tab === 'checkin' && <CheckInPlaceholder />}
        {tab === 'progress' && <ProgressPlaceholder />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

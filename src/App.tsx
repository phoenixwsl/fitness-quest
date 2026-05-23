import { useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'
import TodayPage from './pages/TodayPage'
import CheckInPage from './pages/CheckInPage'
import ProgressPlaceholder from './pages/ProgressPlaceholder'

export default function App() {
  const [tab, setTab] = useState<Tab>('today')

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-800">
      <main className="mx-auto max-w-md">
        {tab === 'today' && <TodayPage />}
        {tab === 'checkin' && <CheckInPage />}
        {tab === 'progress' && <ProgressPlaceholder />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

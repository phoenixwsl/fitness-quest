import { useEffect, useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'
import HealthNotice from './components/HealthNotice'
import TodayPage from './pages/TodayPage'
import CheckInPage from './pages/CheckInPage'
import ProgressPlaceholder from './pages/ProgressPlaceholder'
import { getHealthAck, setHealthAck } from './db'

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [acked, setAcked] = useState<boolean | null>(null)

  useEffect(() => {
    let alive = true
    getHealthAck().then((v) => {
      if (alive) setAcked(v)
    })
    return () => {
      alive = false
    }
  }, [])

  if (acked === null) {
    return <p className="p-6 text-center text-slate-400">加载中…</p>
  }

  if (!acked) {
    return (
      <HealthNotice
        onAck={async () => {
          await setHealthAck(true)
          setAcked(true)
        }}
      />
    )
  }

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

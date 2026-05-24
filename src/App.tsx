import { useEffect, useState } from 'react'
import BottomNav, { type Tab } from './components/BottomNav'
import HealthNotice from './components/HealthNotice'
import TodayPage from './pages/TodayPage'
import CheckInPage from './pages/CheckInPage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'
import UpdatePrompt from './components/UpdatePrompt'
import { getHealthAck, setHealthAck } from './db'

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [acked, setAcked] = useState<boolean | null>(null)
  const [showSettings, setShowSettings] = useState(false)

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

  if (showSettings) {
    return <SettingsPage onClose={() => setShowSettings(false)} />
  }

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-800">
      <button
        type="button"
        onClick={() => setShowSettings(true)}
        aria-label="设置"
        className="fixed right-3 top-3 z-20 rounded-full bg-white/80 px-2 py-1 text-lg shadow-sm backdrop-blur"
      >
        ⚙️
      </button>
      <main className="mx-auto max-w-md">
        {tab === 'today' && <TodayPage />}
        {tab === 'checkin' && <CheckInPage />}
        {tab === 'progress' && <ProgressPage />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
      <UpdatePrompt />
    </div>
  )
}

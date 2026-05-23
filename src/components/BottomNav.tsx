export type Tab = 'today' | 'checkin' | 'progress'

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: '今日' },
  { id: 'checkin', label: '复盘' },
  { id: 'progress', label: '进展' },
]

export default function BottomNav({
  active,
  onChange,
}: {
  active: Tab
  onChange: (tab: Tab) => void
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-current={active === t.id ? 'page' : undefined}
            className={`flex-1 py-3 text-sm font-medium ${
              active === t.id ? 'text-teal-700' : 'text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

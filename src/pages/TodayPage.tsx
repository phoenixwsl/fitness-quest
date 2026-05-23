import { useEffect, useState } from 'react'
import type { DayPlan } from '../types'
import { getAnchorDate } from '../db'
import { planDayIndex, todayKey } from '../lib/date'
import { getPlanForDayIndex } from '../data/planTemplate'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-slate-800">{title}</h2>
      {children}
    </section>
  )
}

export default function TodayPage() {
  const [plan, setPlan] = useState<DayPlan | null>(null)
  const today = todayKey()

  useEffect(() => {
    let alive = true
    getAnchorDate().then((anchor) => {
      if (alive) setPlan(getPlanForDayIndex(planDayIndex(anchor, today)))
    })
    return () => {
      alive = false
    }
  }, [today])

  if (!plan) {
    return <p className="p-6 text-center text-slate-400">加载今日计划…</p>
  }

  const isRest = plan.type === 'rest'

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <header className="pt-2">
        <p className="text-sm text-slate-500">{today}</p>
        <h1 className="text-xl font-bold text-slate-900">今日 · {plan.label}</h1>
      </header>

      <Card title={plan.morningTitle}>
        {isRest ? (
          <p className="text-slate-600">今天休息,给身体恢复的时间。只做晚间体态放松 + 复盘即可。</p>
        ) : (
          <>
            {plan.warmup.length > 0 && (
              <p className="mb-3 text-sm text-slate-500">热身:{plan.warmup.join(' · ')}</p>
            )}
            <ol className="flex flex-col gap-2">
              {plan.main.map((e) => (
                <li key={e.name} className="border-b border-slate-100 pb-2 last:border-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium text-slate-800">{e.name}</span>
                    <span className="shrink-0 text-sm text-teal-700">{e.prescription}</span>
                  </div>
                  {e.note && <p className="mt-0.5 text-xs text-slate-500">{e.note}</p>}
                </li>
              ))}
            </ol>
            {plan.safetyNote && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                ⚠️ {plan.safetyNote}
              </p>
            )}
          </>
        )}
      </Card>

      <Card title="晚间体态放松">
        <p className="mb-2 text-xs text-slate-500">睡前约 10 分钟,温和、助眠、对脊柱有益。</p>
        <ul className="flex flex-col gap-1 text-slate-700">
          {plan.eveningMobility.map((m) => (
            <li key={m}>· {m}</li>
          ))}
        </ul>
      </Card>

      <Card title="饮食 / 喝水">
        <p className="text-sm text-slate-700">{plan.diet}</p>
        <p className="mt-1 text-sm text-slate-700">{plan.water}</p>
      </Card>

      <Card title="最低版本">
        <p className="text-sm text-slate-700">{plan.minimumVersion}</p>
      </Card>
    </div>
  )
}

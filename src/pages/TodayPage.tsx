import { useEffect, useState } from 'react'
import type { Equipment, PlanType, Scenario, TimeOfDay, TrainingTypePlan } from '../types'
import { getAnchorDate, getScenario, putScenario } from '../db'
import { planDayIndex, todayKey } from '../lib/date'
import {
  BASE_WARMUP_LIST,
  TIME_OF_DAY,
  getPlanForType,
  getTypeForDayIndex,
} from '../data/planTemplate'
import ScenarioPicker from '../components/ScenarioPicker'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-slate-800">{title}</h2>
      {children}
    </section>
  )
}

function EveningDietMinimum({ plan }: { plan: TrainingTypePlan }) {
  return (
    <>
      <Card title="晚间体态放松">
        <p className="mb-2 text-xs text-slate-500">睡前约 10 分钟,温和、助眠、对脊柱有益(与训练时段无关)。</p>
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
    </>
  )
}

export default function TodayPage() {
  const today = todayKey()
  const [type, setType] = useState<PlanType | null>(null)
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [picking, setPicking] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([getAnchorDate(), getScenario(today)]).then(([anchor, sc]) => {
      if (!alive) return
      setType(getTypeForDayIndex(planDayIndex(anchor, today)))
      if (sc) setScenario(sc)
      setLoaded(true)
    })
    return () => {
      alive = false
    }
  }, [today])

  async function handleConfirm(timeOfDay: TimeOfDay, equipment: Equipment) {
    const sc: Scenario = { date: today, timeOfDay, equipment }
    await putScenario(sc)
    setScenario(sc)
    setPicking(false)
  }

  if (!loaded || !type) {
    return <p className="p-6 text-center text-slate-400">加载今日计划…</p>
  }

  const plan = getPlanForType(type)

  // 休息日不需要选场景。
  if (type === 'rest') {
    return (
      <div className="flex flex-col gap-4 p-4 pb-24">
        <header className="pt-2">
          <p className="text-sm text-slate-500">{today}</p>
          <h1 className="text-xl font-bold text-slate-900">今日 · 休息</h1>
        </header>
        <Card title="休息">
          <p className="text-slate-600">今天休息,给身体恢复的时间。只做晚间体态放松 + 复盘即可。</p>
        </Card>
        <EveningDietMinimum plan={plan} />
      </div>
    )
  }

  if (!scenario || picking) {
    return (
      <ScenarioPicker
        onConfirm={handleConfirm}
        defaultTimeOfDay={scenario?.timeOfDay}
        defaultEquipment={scenario?.equipment}
      />
    )
  }

  const tod = TIME_OF_DAY[scenario.timeOfDay]
  const warmup = [...BASE_WARMUP_LIST, ...tod.warmupExtra]
  const mainList = plan.main[scenario.equipment]

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <header className="pt-2">
        <p className="text-sm text-slate-500">{today}</p>
        <h1 className="text-xl font-bold text-slate-900">今日 · {plan.label}</h1>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-sm text-slate-500">
            场景:{tod.label} · {scenario.equipment === 'equipped' ? '有器械' : '无器械'}
          </span>
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="text-sm text-teal-700 underline"
          >
            重选场景
          </button>
        </div>
      </header>

      <Card title={`${tod.label} · ${plan.sessionTitle}`}>
        <p className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">{tod.tip}</p>
        <p className="mb-3 text-sm text-slate-500">热身:{warmup.join(' · ')}</p>
        <ol className="flex flex-col gap-2">
          {mainList.map((e) => (
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
      </Card>

      <EveningDietMinimum plan={plan} />
    </div>
  )
}

import { useEffect, useState } from 'react'
import type { Equipment, PlanType, Scenario, TimeOfDay, TrainingTypePlan } from '../types'
import { getAllCounts, getCheckIn, getDailyPlan, getScenario, getSettings, putScenario } from '../db'
import { todayKey } from '../lib/date'
import { DEFAULT_REMINDER_TIME, isCheckinOverdue } from '../lib/reminder'
import { BASE_WARMUP_LIST, TIME_OF_DAY, getPlanForType } from '../data/planTemplate'
import { getExercise } from '../data/exerciseLibrary'
import { getExerciseDiagram } from '../data/exerciseDiagrams'
import ScenarioPicker from '../components/ScenarioPicker'
import ExerciseRow from '../components/ExerciseRow'

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
  const [reason, setReason] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [picking, setPicking] = useState(false)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [overdue, setOverdue] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([
      getDailyPlan(today),
      getScenario(today),
      getAllCounts(),
      getSettings(),
      getCheckIn(today),
    ]).then(([dp, sc, cnts, settings, checkin]) => {
      if (!alive) return
      // 引擎生成的当日计划;无(首次 / 漏复盘)则兜底体态 / 活动度日。
      setType(dp?.type ?? 'mobility')
      setReason(dp?.reason ?? '暂无昨日复盘 → 今日默认体态 / 活动度日')
      if (sc) setScenario(sc)
      setCounts(cnts)
      setOverdue(
        isCheckinOverdue(settings.reminderTime ?? DEFAULT_REMINDER_TIME, new Date(), Boolean(checkin)),
      )
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

  const overdueBanner = overdue ? (
    <p className="rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-800">
      📝 今天还没打卡 · 晚上记得到「复盘」记一笔(从「最低版本」开始也算)。
    </p>
  ) : null

  // 休息日不需要选场景。
  if (type === 'rest') {
    return (
      <div className="flex flex-col gap-4 p-4 pb-24">
        <header className="pt-2">
          <p className="text-sm text-slate-500">{today}</p>
          <h1 className="text-xl font-bold text-slate-900">今日 · 休息</h1>
          <p className="mt-1 text-xs text-slate-400">为什么是今天:{reason}</p>
        </header>
        {overdueBanner}
        <Card title="休息">
          <p className="text-slate-600">今天休息,给身体恢复的时间。只做晚间体态放松 + 复盘即可。</p>
        </Card>
        <EveningDietMinimum plan={plan} />
      </div>
    )
  }

  if (!scenario || picking) {
    return (
      <div>
        {overdueBanner && <div className="p-4 pb-0">{overdueBanner}</div>}
        <ScenarioPicker
          onConfirm={handleConfirm}
          defaultTimeOfDay={scenario?.timeOfDay}
          defaultEquipment={scenario?.equipment}
        />
      </div>
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
        <p className="mt-1 text-xs text-slate-400">为什么是今天:{reason}</p>
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

      {overdueBanner}

      <Card title={`${tod.label} · ${plan.sessionTitle}`}>
        <p className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">{tod.tip}</p>
        <p className="mb-3 text-sm text-slate-500">热身:{warmup.join(' · ')}</p>
        <ol className="flex flex-col">
          {mainList.map((e) => (
            <ExerciseRow
              key={e.exerciseId}
              exercise={getExercise(e.exerciseId)}
              name={e.name}
              prescription={e.prescription}
              note={e.note}
              count={counts[e.exerciseId] ?? 0}
              diagramUrl={getExerciseDiagram(e.exerciseId)}
            />
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

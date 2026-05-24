import { useEffect, useState } from 'react'
import type {
  ActivityTag,
  CheckIn,
  DietRating,
  Energy,
  PoseTag,
  Stiffness,
  TrainingStatus,
  WaterStatus,
} from '../types'
import {
  getAnchorDate,
  getCheckIn,
  putCheckIn,
  putMetric,
  putPhoto,
} from '../db'
import { planDayIndex, todayKey } from '../lib/date'
import { getPlanForType, getTypeForDayIndex } from '../data/planTemplate'
import PhotoPicker from '../components/PhotoPicker'

const TRAINING: { value: TrainingStatus; label: string }[] = [
  { value: 'done', label: '完成' },
  { value: 'partial', label: '部分完成' },
  { value: 'skipped', label: '未做' },
  { value: 'restday', label: '今日为休息日' },
]
const ACTIVITIES: { value: ActivityTag; label: string }[] = [
  { value: 'eveningMobility', label: '晚间体态' },
  { value: 'walk', label: '散步快走' },
  { value: 'water', label: '喝够水' },
  { value: 'dietControl', label: '饮食克制' },
  { value: 'stretch', label: '拉伸' },
  { value: 'earlySleep', label: '早睡' },
]
const DIET: { value: DietRating; label: string }[] = [
  { value: 'good', label: '好' },
  { value: 'ok', label: '一般' },
  { value: 'indulged', label: '放纵了' },
]
const WATER: { value: WaterStatus; label: string }[] = [
  { value: 'enough', label: '够' },
  { value: 'notEnough', label: '不够' },
]
const STIFFNESS: { value: Stiffness; label: string }[] = [
  { value: 'none', label: '无' },
  { value: 'lt30', label: '<30min' },
  { value: '30to60', label: '30–60min' },
  { value: 'gt60', label: '>60min' },
]
const ENERGY: { value: Energy; label: string }[] = [
  { value: 'low', label: '低' },
  { value: 'mid', label: '中' },
  { value: 'high', label: '高' },
]

function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl bg-white p-4 shadow-sm">
      <legend className="px-1 text-sm font-semibold text-slate-800">{title}</legend>
      <div className="mt-2">{children}</div>
    </fieldset>
  )
}

function RadioRow<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label
          key={o.value}
          className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${
            value === o.value
              ? 'border-teal-600 bg-teal-50 text-teal-700'
              : 'border-slate-200 text-slate-600'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}

export default function CheckInPage() {
  const today = todayKey()
  const [tomorrowIdx, setTomorrowIdx] = useState<number | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [view, setView] = useState<'form' | 'result'>('form')
  const [resultRedFlag, setResultRedFlag] = useState(false)
  const [statusText, setStatusText] = useState('')

  // 表单字段(给出合理默认,保证 ≤90 秒可完成)。
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>('done')
  const [activityTags, setActivityTags] = useState<ActivityTag[]>([])
  const [dietRating, setDietRating] = useState<DietRating>('ok')
  const [water, setWater] = useState<WaterStatus>('enough')
  const [stiffness, setStiffness] = useState<Stiffness>('none')
  const [pain, setPain] = useState(0)
  const [energy, setEnergy] = useState<Energy>('mid')
  const [mood, setMood] = useState(3)
  const [redFlag, setRedFlag] = useState(false)
  const [note, setNote] = useState('')
  const [waist, setWaist] = useState('')
  const [weight, setWeight] = useState('')
  const [photo, setPhoto] = useState<{ file: File; pose: PoseTag } | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([getAnchorDate(), getCheckIn(today)]).then(([anchor, existing]) => {
      if (!alive) return
      setTomorrowIdx(planDayIndex(anchor, today) + 1)
      if (existing) {
        setResultRedFlag(existing.redFlag)
        setStatusText('今日已完成复盘 ✅')
        setView('result')
      }
      setLoaded(true)
    })
    return () => {
      alive = false
    }
  }, [today])

  function toggleActivity(tag: ActivityTag) {
    setActivityTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  async function handleSubmit() {
    const photoIds: string[] = []
    if (photo) {
      const id = crypto.randomUUID()
      await putPhoto({
        id,
        blob: photo.file,
        takenAt: Date.now(),
        pose: photo.pose,
        checkInDate: today,
      })
      photoIds.push(id)
    }

    const checkIn: CheckIn = {
      date: today,
      trainingStatus,
      activityTags,
      dietRating,
      water,
      stiffness,
      pain,
      energy,
      mood,
      redFlag,
      note: note.trim() || undefined,
      photoIds,
      isBackfill: false,
      createdAt: Date.now(),
    }
    await putCheckIn(checkIn)

    const waistNum = parseFloat(waist)
    const weightNum = parseFloat(weight)
    if (!Number.isNaN(waistNum) || !Number.isNaN(weightNum)) {
      await putMetric({
        date: today,
        waist: Number.isNaN(waistNum) ? undefined : waistNum,
        weight: Number.isNaN(weightNum) ? undefined : weightNum,
      })
    }

    setResultRedFlag(redFlag)
    setStatusText('复盘已保存,明天见 ✅')
    setView('result')
  }

  if (!loaded) {
    return <p className="p-6 text-center text-slate-400">加载中…</p>
  }

  if (view === 'result') {
    const tomorrow = tomorrowIdx === null ? null : getPlanForType(getTypeForDayIndex(tomorrowIdx))
    return (
      <div className="flex flex-col gap-4 p-4 pb-24">
        <header className="pt-2">
          <h1 className="text-xl font-bold text-slate-900">{statusText}</h1>
        </header>
        {resultRedFlag ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <h2 className="mb-1 text-base font-semibold text-red-700">明日计划:休息</h2>
            <p className="text-sm text-red-700">
              检测到红旗信号。明日请休息,不安排任何训练,并尽快就医 / 联系风湿科或康复科评估。
            </p>
          </section>
        ) : (
          tomorrow && (
            <section className="rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="mb-1 text-base font-semibold text-slate-800">明日计划</h2>
              <p className="text-teal-700">{tomorrow.label}</p>
              <p className="mt-1 text-sm text-slate-500">{tomorrow.sessionTitle}</p>
              <p className="mt-2 text-xs text-slate-400">
                这是静态一周计划的下一天;动态引擎将在 v1 接入。
              </p>
            </section>
          )
        )}
        <button
          type="button"
          onClick={() => setView('form')}
          className="w-fit rounded-lg px-3 py-2 text-sm text-slate-500 underline"
        >
          重新填写
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4 pb-24">
      <header className="pt-2">
        <p className="text-sm text-slate-500">{today}</p>
        <h1 className="text-xl font-bold text-slate-900">今晚复盘</h1>
        <p className="text-xs text-slate-400">每天一次,约 90 秒。漏了也没关系,随时补上。</p>
      </header>

      <Field title="今日训练">
        <RadioRow name="training" value={trainingStatus} options={TRAINING} onChange={setTrainingStatus} />
      </Field>

      <Field title="今日还做了什么">
        <div className="flex flex-wrap gap-2">
          {ACTIVITIES.map((a) => (
            <label
              key={a.value}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${
                activityTags.includes(a.value)
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <input
                type="checkbox"
                checked={activityTags.includes(a.value)}
                onChange={() => toggleActivity(a.value)}
                className="sr-only"
              />
              {a.label}
            </label>
          ))}
        </div>
      </Field>

      <Field title="饮食自评">
        <RadioRow name="diet" value={dietRating} options={DIET} onChange={setDietRating} />
      </Field>

      <Field title="喝水">
        <RadioRow name="water" value={water} options={WATER} onChange={setWater} />
      </Field>

      <Field title="晨僵时长">
        <RadioRow name="stiffness" value={stiffness} options={STIFFNESS} onChange={setStiffness} />
      </Field>

      <Field title="疼痛程度">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={10}
            value={pain}
            aria-label="疼痛程度"
            onChange={(e) => setPain(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-6 text-right text-sm text-slate-700">{pain}</span>
        </div>
      </Field>

      <Field title="能量水平">
        <RadioRow name="energy" value={energy} options={ENERGY} onChange={setEnergy} />
      </Field>

      <Field title="心情">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={5}
            value={mood}
            aria-label="心情"
            onChange={(e) => setMood(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-6 text-right text-sm text-slate-700">{mood}</span>
        </div>
      </Field>

      <Field title="红旗自检">
        <label className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={redFlag}
            onChange={(e) => setRedFlag(e.target.checked)}
            className="mt-1"
          />
          <span>
            出现上述红旗信号(新发剧痛 / 夜间痛影响睡眠 / 疼痛麻木放射到腿 / 关节肿胀发热伴发烧 /
            胸背突发剧痛)中的任意一项。
          </span>
        </label>
      </Field>

      <Field title="一句话备注(选填)">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          placeholder="今天的感受或想记下的事"
        />
      </Field>

      <Field title="照片(选填)">
        <PhotoPicker onChange={(file, pose) => setPhoto(file ? { file, pose } : null)} />
      </Field>

      <Field title="腰围 / 体重(选填,月度参考)">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="waist" className="text-sm text-slate-600">
              腰围(cm,选填)
            </label>
            <input
              id="waist"
              type="number"
              inputMode="decimal"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="weight" className="text-sm text-slate-600">
              体重(kg,选填)
            </label>
            <input
              id="weight"
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
            />
          </div>
        </div>
      </Field>

      <button
        type="button"
        onClick={handleSubmit}
        className="mt-2 rounded-xl bg-teal-600 py-3 text-base font-semibold text-white"
      >
        完成复盘打卡
      </button>
    </div>
  )
}

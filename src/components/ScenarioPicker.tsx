import { useState } from 'react'
import type { Equipment, TimeOfDay } from '../types'

const TIMES: { value: TimeOfDay; label: string }[] = [
  { value: 'morning', label: '上午' },
  { value: 'afternoon', label: '下午' },
  { value: 'evening', label: '晚上' },
]
const EQUIPS: { value: Equipment; label: string }[] = [
  { value: 'equipped', label: '有器械' },
  { value: 'bodyweight', label: '无器械' },
]

function PillGroup<T extends string>({
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
          className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${
            value === o.value
              ? 'border-teal-600 bg-teal-50 text-teal-700'
              : 'border-slate-200 text-slate-600'
          }`}
        >
          <input
            type="radio"
            name={name}
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

export default function ScenarioPicker({
  onConfirm,
  defaultTimeOfDay = 'afternoon',
  defaultEquipment = 'equipped',
}: {
  onConfirm: (timeOfDay: TimeOfDay, equipment: Equipment) => void
  defaultTimeOfDay?: TimeOfDay
  defaultEquipment?: Equipment
}) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(defaultTimeOfDay)
  const [equipment, setEquipment] = useState<Equipment>(defaultEquipment)

  return (
    <div className="flex flex-col gap-5 p-4">
      <header className="pt-2">
        <h1 className="text-xl font-bold text-slate-900">选择场景</h1>
        <p className="text-xs text-slate-400">先告诉我现在练:什么时间段、有没有器械。可随时重选。</p>
      </header>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">时间段</h2>
        <PillGroup name="timeOfDay" value={timeOfDay} options={TIMES} onChange={setTimeOfDay} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">器械</h2>
        <PillGroup name="equipment" value={equipment} options={EQUIPS} onChange={setEquipment} />
      </section>

      <button
        type="button"
        onClick={() => onConfirm(timeOfDay, equipment)}
        className="mt-2 rounded-xl bg-teal-600 py-3 text-base font-semibold text-white"
      >
        开始训练
      </button>
    </div>
  )
}

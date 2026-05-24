import { useState } from 'react'
import type { Exercise } from '../types'
import { shouldCollapse } from '../lib/decay'

function DetailText({ title, text }: { title: string; text: string }) {
  return (
    <p className="text-xs text-slate-600">
      <span className="font-semibold text-slate-500">{title}:</span> {text}
    </p>
  )
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="text-xs text-slate-600">
      <span className="font-semibold text-slate-500">{title}:</span>
      <ul className="mt-0.5 flex flex-col gap-0.5 pl-3">
        {items.map((it) => (
          <li key={it} className="list-disc">
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ExerciseRow({
  exercise,
  name,
  prescription,
  note,
  count,
  diagramUrl,
}: {
  exercise?: Exercise
  name: string
  prescription: string
  note?: string
  count: number
  diagramUrl?: string
}) {
  // 详细度衰减:新手期默认展开,熟练后默认折叠;用户可手动切换(本会话内)。
  const [expanded, setExpanded] = useState(!shouldCollapse(count))

  return (
    <li className="border-b border-slate-100 py-2 last:border-0">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-baseline justify-between gap-3 text-left"
      >
        <span className="font-medium text-slate-800">
          {name}
          <span className="ml-1 text-xs text-slate-400">{expanded ? '收起' : '展开'}</span>
        </span>
        <span className="shrink-0 text-sm text-teal-700">{prescription}</span>
      </button>
      {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
      {expanded && exercise && (
        <div className="mt-2 flex flex-col gap-1.5 rounded-lg bg-slate-50 p-3">
          {diagramUrl && (
            <img
              src={diagramUrl}
              alt={`${name} 示意图`}
              className="mb-1 w-full max-w-[220px] self-center rounded-lg bg-white"
            />
          )}
          <DetailText title="目标部位" text={exercise.target} />
          <DetailList title="怎么做" items={exercise.steps} />
          <DetailList title="要领" items={exercise.cues} />
          <DetailList title="常见错误" items={exercise.mistakes} />
          <DetailText title="AS 安全" text={exercise.asSafety} />
          <DetailText title="替代动作" text={exercise.alternative} />
        </div>
      )}
    </li>
  )
}

import { useState } from 'react'
import type { Exercise } from '../types'
import { shouldCollapse } from '../lib/decay'
import { getExerciseSvg, getWgerImage } from '../lib/exerciseAssets'

function DetailText({ title, text, textEn }: { title: string; text: string; textEn?: string }) {
  return (
    <div className="text-xs text-slate-600">
      <span className="font-semibold text-slate-500">{title}:</span> {text}
      {textEn && <p className="text-slate-400">{textEn}</p>}
    </div>
  )
}

function DetailList({
  title,
  items,
  itemsEn,
}: {
  title: string
  items: string[]
  itemsEn?: string[]
}) {
  return (
    <div className="text-xs text-slate-600">
      <span className="font-semibold text-slate-500">{title}:</span>
      <ul className="mt-0.5 flex flex-col gap-0.5 pl-3">
        {items.map((it, i) => (
          <li key={it} className="list-disc">
            {it}
            {itemsEn?.[i] && <span className="block text-slate-400">{itemsEn[i]}</span>}
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
}: {
  exercise?: Exercise
  name: string
  prescription: string
  note?: string
  count: number
}) {
  // 详细度衰减:新手期默认展开,熟练后默认折叠;用户可手动切换(本会话内)。
  const [expanded, setExpanded] = useState(!shouldCollapse(count))

  const svg = exercise ? getExerciseSvg(exercise.id) : undefined
  const wger = exercise ? getWgerImage(exercise.id) : undefined

  return (
    <li className="border-b border-slate-100 py-2 last:border-0">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-baseline justify-between gap-3 text-left"
      >
        <span className="font-medium text-slate-800">
          {name}
          {exercise?.en.name && (
            <span className="ml-1 text-xs font-normal text-slate-400">{exercise.en.name}</span>
          )}
          <span className="ml-1 text-xs text-slate-400">{expanded ? '收起' : '展开'}</span>
        </span>
        <span className="shrink-0 text-sm text-teal-700">{prescription}</span>
      </button>
      {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
      {expanded && exercise && (
        <div className="mt-2 flex flex-col gap-1.5 rounded-lg bg-slate-50 p-3">
          {svg && (
            <img
              src={svg}
              alt={`${exercise.name} 示意图`}
              className="mx-auto h-32 w-auto"
              loading="lazy"
            />
          )}
          {wger && (
            <figure className="m-0">
              <img
                src={wger.src}
                alt={`${exercise.name} 参考图`}
                className="mx-auto max-h-40 w-auto rounded"
                loading="lazy"
              />
              <figcaption className="mt-0.5 text-center text-[10px] text-slate-400">
                部分图片来自 wger(CC-BY-SA 3.0){wger.author ? ` · ${wger.author}` : ''}
              </figcaption>
            </figure>
          )}
          <DetailText title="目标部位" text={exercise.target} textEn={exercise.en.target} />
          <DetailList title="怎么做" items={exercise.steps} itemsEn={exercise.en.steps} />
          <DetailList title="要领" items={exercise.cues} itemsEn={exercise.en.cues} />
          <DetailList title="常见错误" items={exercise.mistakes} itemsEn={exercise.en.mistakes} />
          <DetailText title="AS 安全" text={exercise.asSafety} textEn={exercise.en.asSafety} />
          <DetailText title="替代动作" text={exercise.alternative} textEn={exercise.en.alternative} />
        </div>
      )}
    </li>
  )
}

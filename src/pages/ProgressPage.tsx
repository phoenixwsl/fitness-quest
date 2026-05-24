import { useEffect, useState } from 'react'
import type { CheckIn, Metric, Photo, PoseTag } from '../types'
import { getAllCheckIns, getAllMetrics, getAllPhotos, getSettings } from '../db'
import { isBackupStale } from '../lib/backup'
import { todayKey } from '../lib/date'
import {
  completionRate,
  currentStreak,
  stiffnessSeries,
  waistSeries,
  weeklySummary,
  weightSeries,
  type Point,
} from '../lib/trends'
import Sparkline from '../components/Sparkline'

const POSE_LABEL: Record<PoseTag, string> = { front: '正面', side: '侧面', back: '背面' }

function BackupReminder({ stale }: { stale: boolean }) {
  if (!stale) return null
  return (
    <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
      💾 数据只存在这台设备上,记得定期到「设置 → 数据备份」导出一份,换手机或清缓存前尤其要先导出。
    </p>
  )
}

function TrendCard({ title, points, hint }: { title: string; points: Point[]; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{title}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      <Sparkline points={points.map((p) => p.value)} ariaLabel={title} />
    </div>
  )
}

export default function ProgressPage() {
  const [photos, setPhotos] = useState<Photo[] | null>(null)
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [backupStale, setBackupStale] = useState(false)

  useEffect(() => {
    let alive = true
    const created: string[] = []
    Promise.all([getAllPhotos(), getAllCheckIns(), getAllMetrics(), getSettings()]).then(
      ([ps, cis, ms, s]) => {
        if (!alive) return
        const map: Record<string, string> = {}
        for (const p of ps) {
          const u = URL.createObjectURL(p.blob)
          map[p.id] = u
          created.push(u)
        }
        setPhotos(ps)
        setUrls(map)
        setCheckIns(cis)
        setMetrics(ms)
        setBackupStale(isBackupStale(s.lastBackupAt, Date.now()))
      },
    )
    return () => {
      alive = false
      created.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  if (!photos) {
    return <p className="p-6 text-center text-slate-400">加载中…</p>
  }

  const today = todayKey()
  const rate = completionRate(checkIns)
  const streak = currentStreak(checkIns, today)
  const summary = weeklySummary(checkIns, today)

  // 选择最多两张并排对比;超过则替换最早选的那张。
  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 2 ? [prev[1], id] : [...prev, id],
    )
  }

  const compare = selected
    .map((id) => photos.find((p) => p.id === id))
    .filter((p): p is Photo => Boolean(p))

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <header className="pt-2">
        <h1 className="text-xl font-bold text-slate-900">进展</h1>
      </header>

      <BackupReminder stale={backupStale} />

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-slate-800">本周小结</h2>
        <p className="text-sm text-slate-700">{summary.text}</p>
        <div className="mt-2 flex gap-4 text-xs text-slate-500">
          <span>连续打卡 {streak} 天</span>
          {rate !== null && <span>训练完成率 {Math.round(rate * 100)}%</span>}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-800">趋势</h2>
        <div className="flex flex-col gap-3">
          <TrendCard title="腰围 (cm)" points={waistSeries(metrics)} hint="主指标" />
          <TrendCard title="晨僵档位" points={stiffnessSeries(checkIns)} hint="0 无 → 3 >60min" />
          <TrendCard title="体重 (kg)" points={weightSeries(metrics)} hint="仅月度参考" />
        </div>
        <p className="mt-2 text-xs text-slate-400">数据少时曲线短是正常的,记录久了才看得出趋势。</p>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">照片时间线</h2>
          <p className="text-xs text-slate-400">点两张照片并排对比,诚实记录变化(不做美颜)。</p>
        </div>

        {photos.length === 0 ? (
          <p className="text-sm text-slate-400">还没有照片。复盘时拍一张,这里会按时间线记录你的变化。</p>
        ) : (
          <>
            {compare.length === 2 && (
              <div
                role="region"
                aria-label="对比"
                className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-3 shadow-sm"
              >
                {compare.map((p) => (
                  <figure key={p.id} className="m-0">
                    <img
                      src={urls[p.id]}
                      alt={`对比 ${POSE_LABEL[p.pose]} ${p.checkInDate}`}
                      className="w-full rounded-lg object-cover"
                    />
                    <figcaption className="mt-1 text-center text-xs text-slate-500">
                      {p.checkInDate} · {POSE_LABEL[p.pose]}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  aria-pressed={selected.includes(p.id)}
                  className={`flex flex-col gap-1 rounded-lg border p-1 ${
                    selected.includes(p.id) ? 'border-teal-600' : 'border-transparent'
                  }`}
                >
                  <img
                    src={urls[p.id]}
                    alt={`${POSE_LABEL[p.pose]} ${p.checkInDate}`}
                    className="aspect-square w-full rounded bg-slate-100 object-cover"
                  />
                  <span className="text-xs text-slate-500">
                    {p.checkInDate} · {POSE_LABEL[p.pose]}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

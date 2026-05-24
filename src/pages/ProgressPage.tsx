import { useEffect, useState } from 'react'
import type { Photo, PoseTag } from '../types'
import { getAllPhotos, getSettings } from '../db'
import { isBackupStale } from '../lib/backup'

const POSE_LABEL: Record<PoseTag, string> = { front: '正面', side: '侧面', back: '背面' }

function BackupReminder({ stale }: { stale: boolean }) {
  if (!stale) return null
  return (
    <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
      💾 数据只存在这台设备上,记得定期到「设置 → 数据备份」导出一份,换手机或清缓存前尤其要先导出。
    </p>
  )
}

export default function ProgressPage() {
  const [photos, setPhotos] = useState<Photo[] | null>(null)
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string[]>([])
  const [backupStale, setBackupStale] = useState(false)

  useEffect(() => {
    let alive = true
    const created: string[] = []
    getSettings().then((s) => {
      if (alive) setBackupStale(isBackupStale(s.lastBackupAt, Date.now()))
    })
    getAllPhotos().then((ps) => {
      if (!alive) return
      const map: Record<string, string> = {}
      for (const p of ps) {
        const u = URL.createObjectURL(p.blob)
        map[p.id] = u
        created.push(u)
      }
      setPhotos(ps)
      setUrls(map)
    })
    return () => {
      alive = false
      created.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  if (!photos) {
    return <p className="p-6 text-center text-slate-400">加载中…</p>
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-10 pb-24 text-center">
        <h1 className="text-lg font-semibold text-slate-700">进展</h1>
        <p className="text-sm text-slate-400">还没有照片。复盘时拍一张,这里会按时间线记录你的变化。</p>
        <BackupReminder stale={backupStale} />
      </div>
    )
  }

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
        <h1 className="text-xl font-bold text-slate-900">进展 · 照片时间线</h1>
        <p className="text-xs text-slate-400">点两张照片并排对比,诚实记录变化(不做美颜)。</p>
      </header>

      <BackupReminder stale={backupStale} />

      {compare.length === 2 && (
        <section aria-label="对比" className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-3 shadow-sm">
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
        </section>
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
    </div>
  )
}

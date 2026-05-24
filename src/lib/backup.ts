import type { RawDump } from '../db'
import type { PoseTag } from '../types'

// 备份文件:单个 JSON。照片 blob 编码为 base64 字符串内联,实现「单文件」导出。
const APP_TAG = 'fitness-quest'
const SCHEMA = 1

export interface SerializedPhoto {
  id: string
  base64: string
  type: string
  takenAt: number
  pose: PoseTag
  checkInDate: string
}

export interface BackupFile {
  app: typeof APP_TAG
  schema: number
  exportedAt: number
  data: {
    settings: RawDump['settings']
    checkIns: RawDump['checkIns']
    photos: SerializedPhoto[]
    metrics: RawDump['metrics']
    scenarios: RawDump['scenarios']
    dailyPlans: RawDump['dailyPlans']
    exerciseCounts: RawDump['exerciseCounts']
  }
}

// 是否该提醒备份:从未备份,或距上次备份超过 staleDays 天。
export function isBackupStale(
  lastBackupAt: number | undefined,
  now: number,
  staleDays = 14,
): boolean {
  if (lastBackupAt === undefined) return true
  return now - lastBackupAt > staleDays * 24 * 60 * 60 * 1000
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const result = reader.result as string // data:<type>;base64,<data>
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.readAsDataURL(blob)
  })
}

export function base64ToBlob(base64: string, type: string): Blob {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type })
}

export async function serializeBackup(dump: RawDump): Promise<BackupFile> {
  const photos: SerializedPhoto[] = []
  for (const p of dump.photos) {
    photos.push({
      id: p.id,
      base64: await blobToBase64(p.blob),
      type: p.blob.type,
      takenAt: p.takenAt,
      pose: p.pose,
      checkInDate: p.checkInDate,
    })
  }
  return {
    app: APP_TAG,
    schema: SCHEMA,
    exportedAt: Date.now(),
    data: {
      settings: dump.settings,
      checkIns: dump.checkIns,
      photos,
      metrics: dump.metrics,
      scenarios: dump.scenarios,
      dailyPlans: dump.dailyPlans,
      exerciseCounts: dump.exerciseCounts,
    },
  }
}

export function deserializeBackup(file: BackupFile): RawDump {
  if (!file || file.app !== APP_TAG || !file.data) {
    throw new Error('不是有效的健身大闯关备份文件')
  }
  const d = file.data
  return {
    settings: d.settings,
    checkIns: d.checkIns ?? [],
    photos: (d.photos ?? []).map((p) => ({
      id: p.id,
      blob: base64ToBlob(p.base64, p.type),
      takenAt: p.takenAt,
      pose: p.pose,
      checkInDate: p.checkInDate,
    })),
    metrics: d.metrics ?? [],
    scenarios: d.scenarios ?? [],
    dailyPlans: d.dailyPlans ?? [],
    exerciseCounts: d.exerciseCounts ?? [],
  }
}

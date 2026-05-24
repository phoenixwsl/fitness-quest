import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { CheckIn, DailyPlan, Metric, Photo, Scenario } from '../types'
import { todayKey } from '../lib/date'

export interface AppSettings {
  anchorDate: string
  healthNoticeAck?: boolean
  lastBackupAt?: number // 上次导出备份的时间戳
  reminderTime?: string // 复盘提醒时间 'HH:MM'
}

export interface ExerciseCount {
  id: string
  count: number
}

interface FitnessDB extends DBSchema {
  settings: { key: string; value: AppSettings }
  checkIns: { key: string; value: CheckIn }
  photos: { key: string; value: Photo }
  metrics: { key: string; value: Metric }
  scenarios: { key: string; value: Scenario }
  exerciseCounts: { key: string; value: ExerciseCount }
  dailyPlans: { key: string; value: DailyPlan }
}

const DB_NAME = 'fitness-quest'
const DB_VERSION = 4
const SETTINGS_KEY = 'app'

let dbPromise: Promise<IDBPDatabase<FitnessDB>> | undefined

function getDB(): Promise<IDBPDatabase<FitnessDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FitnessDB>(DB_NAME, DB_VERSION, {
      // 幂等建表:任何版本升级都补建缺失的 store,保证 v0 老库平滑升级。
      upgrade(db) {
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings')
        if (!db.objectStoreNames.contains('checkIns')) db.createObjectStore('checkIns', { keyPath: 'date' })
        if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('metrics')) db.createObjectStore('metrics', { keyPath: 'date' })
        if (!db.objectStoreNames.contains('scenarios')) db.createObjectStore('scenarios', { keyPath: 'date' })
        if (!db.objectStoreNames.contains('exerciseCounts')) db.createObjectStore('exerciseCounts', { keyPath: 'id' })
        if (!db.objectStoreNames.contains('dailyPlans')) db.createObjectStore('dailyPlans', { keyPath: 'date' })
      },
    })
  }
  return dbPromise
}

// 锚点日期:首次使用日。缺失则写入今天。
export async function getAnchorDate(): Promise<string> {
  const db = await getDB()
  const existing = await db.get('settings', SETTINGS_KEY)
  if (existing) return existing.anchorDate
  const anchorDate = todayKey()
  await db.put('settings', { anchorDate }, SETTINGS_KEY)
  return anchorDate
}

// 读取整个 settings 记录(缺失则给默认,不持久化)。
export async function getSettings(): Promise<AppSettings> {
  const existing = await (await getDB()).get('settings', SETTINGS_KEY)
  return existing ?? { anchorDate: todayKey() }
}

// 合并更新 settings,保留其它字段。
export async function updateSettings(patch: Partial<AppSettings>): Promise<void> {
  const db = await getDB()
  const existing = (await db.get('settings', SETTINGS_KEY)) ?? { anchorDate: todayKey() }
  await db.put('settings', { ...existing, ...patch }, SETTINGS_KEY)
}

// 首启健康须知确认标记。
export async function getHealthAck(): Promise<boolean> {
  const existing = await (await getDB()).get('settings', SETTINGS_KEY)
  return existing?.healthNoticeAck ?? false
}

export async function setHealthAck(acked: boolean): Promise<void> {
  const db = await getDB()
  const existing = await db.get('settings', SETTINGS_KEY)
  await db.put(
    'settings',
    { anchorDate: existing?.anchorDate ?? todayKey(), healthNoticeAck: acked },
    SETTINGS_KEY,
  )
}

export async function getCheckIn(date: string): Promise<CheckIn | undefined> {
  return (await getDB()).get('checkIns', date)
}

export async function putCheckIn(checkIn: CheckIn): Promise<void> {
  await (await getDB()).put('checkIns', checkIn)
}

export async function getAllCheckIns(): Promise<CheckIn[]> {
  return (await getDB()).getAll('checkIns')
}

export async function getPhoto(id: string): Promise<Photo | undefined> {
  return (await getDB()).get('photos', id)
}

export async function putPhoto(photo: Photo): Promise<void> {
  await (await getDB()).put('photos', photo)
}

// 照片时间线:按拍摄时间倒序(最新在前)。
export async function getAllPhotos(): Promise<Photo[]> {
  const all = await (await getDB()).getAll('photos')
  return all.sort((a, b) => b.takenAt - a.takenAt)
}

export async function getMetric(date: string): Promise<Metric | undefined> {
  return (await getDB()).get('metrics', date)
}

export async function putMetric(metric: Metric): Promise<void> {
  await (await getDB()).put('metrics', metric)
}

export async function getAllMetrics(): Promise<Metric[]> {
  return (await getDB()).getAll('metrics')
}

// 场景:用户每次训练前所选(时间段 + 器械),按日期存,当天可重选。
export async function getScenario(date: string): Promise<Scenario | undefined> {
  return (await getDB()).get('scenarios', date)
}

export async function putScenario(scenario: Scenario): Promise<void> {
  await (await getDB()).put('scenarios', scenario)
}

// 引擎为每天生成的训练类型 + 理由。
export async function getDailyPlan(date: string): Promise<DailyPlan | undefined> {
  return (await getDB()).get('dailyPlans', date)
}

export async function putDailyPlan(plan: DailyPlan): Promise<void> {
  await (await getDB()).put('dailyPlans', plan)
}

export async function getAllDailyPlans(): Promise<DailyPlan[]> {
  return (await getDB()).getAll('dailyPlans')
}

// 动作累计完成次数(驱动详细度衰减)。
export async function getCount(id: string): Promise<number> {
  return (await (await getDB()).get('exerciseCounts', id))?.count ?? 0
}

export async function getAllCounts(): Promise<Record<string, number>> {
  const all = await (await getDB()).getAll('exerciseCounts')
  return Object.fromEntries(all.map((c) => [c.id, c.count]))
}

// 复盘训练状态=完成 / 部分完成时,给当天计划里每个动作 +1(整体完成即全部 +1)。
export async function incrementCounts(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const db = await getDB()
  const tx = db.transaction('exerciseCounts', 'readwrite')
  for (const id of ids) {
    const current = (await tx.store.get(id))?.count ?? 0
    await tx.store.put({ id, count: current + 1 })
  }
  await tx.done
}

// ── 备份导出 / 导入 ──────────────────────────────────────────
// 全库原始转储(照片仍为 Blob)。备份序列化在 lib/backup.ts 里做 base64 编解码。
export interface RawDump {
  settings: AppSettings | undefined
  checkIns: CheckIn[]
  photos: Photo[]
  metrics: Metric[]
  scenarios: Scenario[]
  dailyPlans: DailyPlan[]
  exerciseCounts: ExerciseCount[]
}

export async function exportAllStores(): Promise<RawDump> {
  const db = await getDB()
  return {
    settings: await db.get('settings', SETTINGS_KEY),
    checkIns: await db.getAll('checkIns'),
    photos: await db.getAll('photos'),
    metrics: await db.getAll('metrics'),
    scenarios: await db.getAll('scenarios'),
    dailyPlans: await db.getAll('dailyPlans'),
    exerciseCounts: await db.getAll('exerciseCounts'),
  }
}

// 整库覆盖:先清空所有 store,再写入备份内容(调用方须先取得用户确认)。
export async function importAllStores(dump: RawDump): Promise<void> {
  const db = await getDB()
  const stores = [
    'settings',
    'checkIns',
    'photos',
    'metrics',
    'scenarios',
    'dailyPlans',
    'exerciseCounts',
  ] as const
  const tx = db.transaction(stores, 'readwrite')
  for (const s of stores) await tx.objectStore(s).clear()
  if (dump.settings) await tx.objectStore('settings').put(dump.settings, SETTINGS_KEY)
  for (const c of dump.checkIns) await tx.objectStore('checkIns').put(c)
  for (const p of dump.photos) await tx.objectStore('photos').put(p)
  for (const m of dump.metrics) await tx.objectStore('metrics').put(m)
  for (const sc of dump.scenarios) await tx.objectStore('scenarios').put(sc)
  for (const dp of dump.dailyPlans) await tx.objectStore('dailyPlans').put(dp)
  for (const ec of dump.exerciseCounts) await tx.objectStore('exerciseCounts').put(ec)
  await tx.done
}

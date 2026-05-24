import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { CheckIn, Metric, Photo, Scenario } from '../types'
import { todayKey } from '../lib/date'

interface AppSettings {
  anchorDate: string
  healthNoticeAck?: boolean
}

interface FitnessDB extends DBSchema {
  settings: { key: string; value: AppSettings }
  checkIns: { key: string; value: CheckIn }
  photos: { key: string; value: Photo }
  metrics: { key: string; value: Metric }
  scenarios: { key: string; value: Scenario }
}

const DB_NAME = 'fitness-quest'
const DB_VERSION = 2
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

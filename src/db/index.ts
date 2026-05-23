import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { CheckIn, Metric, Photo } from '../types'
import { todayKey } from '../lib/date'

interface AppSettings {
  anchorDate: string
}

interface FitnessDB extends DBSchema {
  settings: { key: string; value: AppSettings }
  checkIns: { key: string; value: CheckIn }
  photos: { key: string; value: Photo }
  metrics: { key: string; value: Metric }
}

const DB_NAME = 'fitness-quest'
const DB_VERSION = 1
const SETTINGS_KEY = 'app'

let dbPromise: Promise<IDBPDatabase<FitnessDB>> | undefined

function getDB(): Promise<IDBPDatabase<FitnessDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FitnessDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('settings')
        db.createObjectStore('checkIns', { keyPath: 'date' })
        db.createObjectStore('photos', { keyPath: 'id' })
        db.createObjectStore('metrics', { keyPath: 'date' })
      },
    })
  }
  return dbPromise
}

// 锚点日期:首次使用日。缺失则写入今天。映射「今日 → 静态一周计划」用。
export async function getAnchorDate(): Promise<string> {
  const db = await getDB()
  const existing = await db.get('settings', SETTINGS_KEY)
  if (existing) return existing.anchorDate
  const anchorDate = todayKey()
  await db.put('settings', { anchorDate }, SETTINGS_KEY)
  return anchorDate
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

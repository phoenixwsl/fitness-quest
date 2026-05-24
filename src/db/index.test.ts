import { describe, it, expect, beforeEach, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import type { CheckIn, Metric, Photo } from '../types'

// 每个测试用全新的 IndexedDB + 重置模块,清掉 db 模块内的连接缓存,保证隔离。
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  vi.resetModules()
})

function makeCheckIn(date: string): CheckIn {
  return {
    date,
    trainingStatus: 'done',
    activityTags: ['eveningMobility', 'walk'],
    dietRating: 'good',
    water: 'enough',
    stiffness: 'lt30',
    pain: 1,
    energy: 'mid',
    mood: 4,
    redFlag: false,
    photoIds: [],
    isBackfill: false,
    createdAt: 1000,
  }
}

describe('storage layer', () => {
  it('getAnchorDate 首次调用写入今天并返回,再次调用返回同一值', async () => {
    const db = await import('./index')
    const first = await db.getAnchorDate()
    expect(first).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const second = await db.getAnchorDate()
    expect(second).toBe(first)
  })

  it('putCheckIn / getCheckIn 往返一致', async () => {
    const db = await import('./index')
    const c = makeCheckIn('2026-05-24')
    await db.putCheckIn(c)
    expect(await db.getCheckIn('2026-05-24')).toEqual(c)
  })

  it('getCheckIn 不存在时返回 undefined', async () => {
    const db = await import('./index')
    expect(await db.getCheckIn('2099-01-01')).toBeUndefined()
  })

  it('getAllCheckIns 返回全部', async () => {
    const db = await import('./index')
    await db.putCheckIn(makeCheckIn('2026-05-23'))
    await db.putCheckIn(makeCheckIn('2026-05-24'))
    expect(await db.getAllCheckIns()).toHaveLength(2)
  })

  // 注:blob 内容保真是真实浏览器 IndexedDB 的能力;fake-indexeddb 走 Node
  // structuredClone,识别不了 jsdom 的 Blob(会序列化成 {}),故此处只验证
  // 照片记录按 id 往返、元数据完整,blob 字段存在。
  it('putPhoto / getPhoto 按 id 往返,元数据完整', async () => {
    const db = await import('./index')
    const photo: Photo = {
      id: 'p1',
      blob: new Blob(['hello']),
      takenAt: 123,
      pose: 'front',
      checkInDate: '2026-05-24',
    }
    await db.putPhoto(photo)
    const got = await db.getPhoto('p1')
    expect(got).toBeDefined()
    expect(got?.id).toBe('p1')
    expect(got?.pose).toBe('front')
    expect(got?.takenAt).toBe(123)
    expect(got?.checkInDate).toBe('2026-05-24')
    expect(got).toHaveProperty('blob')
  })

  it('putMetric / getMetric 往返', async () => {
    const db = await import('./index')
    const m: Metric = { date: '2026-05-24', waist: 90, weight: 83 }
    await db.putMetric(m)
    expect(await db.getMetric('2026-05-24')).toEqual(m)
  })

  it('getAllMetrics 返回全部', async () => {
    const db = await import('./index')
    await db.putMetric({ date: '2026-05-23', waist: 91 })
    await db.putMetric({ date: '2026-05-24', waist: 90 })
    expect(await db.getAllMetrics()).toHaveLength(2)
  })

  it('putScenario / getScenario 按日期往返', async () => {
    const db = await import('./index')
    await db.putScenario({ date: '2026-05-24', timeOfDay: 'afternoon', equipment: 'equipped' })
    expect(await db.getScenario('2026-05-24')).toEqual({
      date: '2026-05-24',
      timeOfDay: 'afternoon',
      equipment: 'equipped',
    })
  })

  it('getScenario 不存在时返回 undefined', async () => {
    const db = await import('./index')
    expect(await db.getScenario('2099-01-01')).toBeUndefined()
  })

  it('健康须知:getHealthAck 默认 false,setHealthAck 后为 true', async () => {
    const db = await import('./index')
    expect(await db.getHealthAck()).toBe(false)
    await db.setHealthAck(true)
    expect(await db.getHealthAck()).toBe(true)
  })

  it('setHealthAck 不破坏锚点日期', async () => {
    const db = await import('./index')
    const anchor = await db.getAnchorDate()
    await db.setHealthAck(true)
    expect(await db.getAnchorDate()).toBe(anchor)
  })

  it('incrementCounts 累加;getCount 未知 id 返回 0', async () => {
    const db = await import('./index')
    expect(await db.getCount('goblet-squat')).toBe(0)
    await db.incrementCounts(['goblet-squat', 'dead-bug'])
    await db.incrementCounts(['goblet-squat'])
    expect(await db.getCount('goblet-squat')).toBe(2)
    expect(await db.getCount('dead-bug')).toBe(1)
  })

  it('getAllCounts 返回 id→次数映射', async () => {
    const db = await import('./index')
    await db.incrementCounts(['a', 'a', 'b'])
    expect(await db.getAllCounts()).toEqual({ a: 2, b: 1 })
  })

  it('putDailyPlan / getDailyPlan 按日期往返', async () => {
    const db = await import('./index')
    await db.putDailyPlan({ date: '2026-05-25', type: 'strengthB', reason: '轮换' })
    expect(await db.getDailyPlan('2026-05-25')).toEqual({
      date: '2026-05-25',
      type: 'strengthB',
      reason: '轮换',
    })
  })

  it('getAllDailyPlans 返回全部', async () => {
    const db = await import('./index')
    await db.putDailyPlan({ date: '2026-05-24', type: 'strengthA', reason: 'a' })
    await db.putDailyPlan({ date: '2026-05-25', type: 'mobility', reason: 'b' })
    expect(await db.getAllDailyPlans()).toHaveLength(2)
  })

  it('getAllPhotos 按拍摄时间倒序返回全部', async () => {
    const db = await import('./index')
    await db.putPhoto({ id: 'p1', blob: new Blob(['a']), takenAt: 100, pose: 'front', checkInDate: '2026-05-22' })
    await db.putPhoto({ id: 'p2', blob: new Blob(['b']), takenAt: 300, pose: 'side', checkInDate: '2026-05-24' })
    await db.putPhoto({ id: 'p3', blob: new Blob(['c']), takenAt: 200, pose: 'back', checkInDate: '2026-05-23' })
    expect((await db.getAllPhotos()).map((p) => p.id)).toEqual(['p2', 'p3', 'p1'])
  })

  it('getSettings 默认含 anchorDate;updateSettings 合并保留其它字段', async () => {
    const db = await import('./index')
    const anchor = await db.getAnchorDate()
    await db.updateSettings({ lastBackupAt: 123 })
    const s = await db.getSettings()
    expect(s.anchorDate).toBe(anchor)
    expect(s.lastBackupAt).toBe(123)
    await db.updateSettings({ reminderTime: '21:30' })
    const s2 = await db.getSettings()
    expect(s2.lastBackupAt).toBe(123) // 未被覆盖
    expect(s2.reminderTime).toBe('21:30')
  })

  it('exportAllStores / importAllStores 往返,且 import 先清后写', async () => {
    const db = await import('./index')
    await db.putCheckIn(makeCheckIn('2026-05-24'))
    await db.putMetric({ date: '2026-05-24', waist: 90 })
    const dump = await db.exportAllStores()
    expect(dump.checkIns).toHaveLength(1)
    expect(dump.metrics).toHaveLength(1)

    // 模拟换设备:往现有库塞脏数据,再 import 备份 → 脏数据被清掉
    await db.putCheckIn(makeCheckIn('2099-01-01'))
    await db.importAllStores(dump)
    expect(await db.getCheckIn('2099-01-01')).toBeUndefined()
    expect(await db.getCheckIn('2026-05-24')).toBeDefined()
    expect(await db.getAllMetrics()).toHaveLength(1)
  })
})

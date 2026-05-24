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
})

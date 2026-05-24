import { describe, it, expect } from 'vitest'
import {
  blobToBase64,
  base64ToBlob,
  serializeBackup,
  deserializeBackup,
  isBackupStale,
} from './backup'
import type { RawDump } from '../db'

function makeDump(): RawDump {
  return {
    settings: { anchorDate: '2026-05-20', lastBackupAt: 1 },
    checkIns: [
      {
        date: '2026-05-24',
        trainingStatus: 'done',
        activityTags: ['walk'],
        dietRating: 'good',
        water: 'enough',
        stiffness: 'lt30',
        pain: 1,
        energy: 'mid',
        mood: 4,
        redFlag: false,
        photoIds: ['p1'],
        isBackfill: false,
        createdAt: 1000,
      },
    ],
    photos: [
      { id: 'p1', blob: new Blob(['hello'], { type: 'image/jpeg' }), takenAt: 5, pose: 'front', checkInDate: '2026-05-24' },
    ],
    metrics: [{ date: '2026-05-24', waist: 90 }],
    scenarios: [{ date: '2026-05-24', timeOfDay: 'afternoon', equipment: 'equipped' }],
    dailyPlans: [{ date: '2026-05-25', type: 'mobility', reason: 'r' }],
    exerciseCounts: [{ id: 'goblet-squat', count: 3 }],
  }
}

describe('backup', () => {
  it('blob ↔ base64 往返保留字节大小', async () => {
    const blob = new Blob(['hello'], { type: 'image/jpeg' })
    const b64 = await blobToBase64(blob)
    expect(typeof b64).toBe('string')
    const back = base64ToBlob(b64, 'image/jpeg')
    expect(back).toBeInstanceOf(Blob)
    expect(back.size).toBe(blob.size)
    expect(back.type).toBe('image/jpeg')
  })

  it('serializeBackup 产出带标识的信封,照片转 base64', async () => {
    const file = await serializeBackup(makeDump())
    expect(file.app).toBe('fitness-quest')
    expect(typeof file.exportedAt).toBe('number')
    expect(file.data.checkIns).toHaveLength(1)
    expect(file.data.photos[0].id).toBe('p1')
    expect(typeof file.data.photos[0].base64).toBe('string')
    expect(file.data.photos[0].pose).toBe('front')
  })

  it('serialize → deserialize 往返还原各 store', async () => {
    const dump = makeDump()
    const restored = deserializeBackup(await serializeBackup(dump))
    expect(restored.checkIns).toEqual(dump.checkIns)
    expect(restored.metrics).toEqual(dump.metrics)
    expect(restored.scenarios).toEqual(dump.scenarios)
    expect(restored.dailyPlans).toEqual(dump.dailyPlans)
    expect(restored.exerciseCounts).toEqual(dump.exerciseCounts)
    expect(restored.photos[0].blob).toBeInstanceOf(Blob)
    expect(restored.photos[0].blob.size).toBe(5)
    expect(restored.photos[0].pose).toBe('front')
  })

  it('deserializeBackup 拒绝非本应用的文件', () => {
    expect(() => deserializeBackup({ app: 'other' } as never)).toThrow()
  })

  it('isBackupStale:从未备份或超过 14 天为 true', () => {
    const now = Date.UTC(2026, 4, 24)
    const day = 24 * 60 * 60 * 1000
    expect(isBackupStale(undefined, now)).toBe(true)
    expect(isBackupStale(now - 3 * day, now)).toBe(false)
    expect(isBackupStale(now - 20 * day, now)).toBe(true)
  })
})

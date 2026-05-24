import { describe, it, expect } from 'vitest'
import { isCheckinOverdue, DEFAULT_REMINDER_TIME } from './reminder'

function at(h: number, m: number): Date {
  return new Date(2026, 4, 24, h, m)
}

describe('reminder', () => {
  it('默认提醒时间为 21:30', () => {
    expect(DEFAULT_REMINDER_TIME).toBe('21:30')
  })

  it('今天已打卡则永不提醒', () => {
    expect(isCheckinOverdue('21:30', at(23, 0), true)).toBe(false)
  })

  it('未打卡且已过提醒时间 → 提醒', () => {
    expect(isCheckinOverdue('21:30', at(21, 30), false)).toBe(true)
    expect(isCheckinOverdue('21:30', at(22, 0), false)).toBe(true)
  })

  it('未打卡但还没到提醒时间 → 不提醒', () => {
    expect(isCheckinOverdue('21:30', at(20, 0), false)).toBe(false)
    expect(isCheckinOverdue('21:30', at(21, 29), false)).toBe(false)
  })
})

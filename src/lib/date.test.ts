import { describe, it, expect } from 'vitest'
import { todayKey, daysSinceAnchor, planDayIndex, addDays } from './date'

describe('date utils', () => {
  it('todayKey 返回本地 YYYY-MM-DD', () => {
    expect(todayKey(new Date(2026, 4, 24))).toBe('2026-05-24') // 月份 0-based
    expect(todayKey(new Date(2026, 0, 9))).toBe('2026-01-09') // 补零
  })

  it('daysSinceAnchor 计算整天差', () => {
    expect(daysSinceAnchor('2026-05-24', '2026-05-24')).toBe(0)
    expect(daysSinceAnchor('2026-05-20', '2026-05-24')).toBe(4)
  })

  it('daysSinceAnchor 跨月正确', () => {
    expect(daysSinceAnchor('2026-04-30', '2026-05-02')).toBe(2)
  })

  it('planDayIndex 对 7 取模', () => {
    expect(planDayIndex('2026-05-20', '2026-05-20')).toBe(0)
    expect(planDayIndex('2026-05-20', '2026-05-22')).toBe(2)
    expect(planDayIndex('2026-05-20', '2026-05-27')).toBe(0) // 第 7 天回到 0
  })

  it('planDayIndex 在 today 早于 anchor 时不返回负数', () => {
    expect(planDayIndex('2026-05-20', '2026-05-19')).toBe(6)
  })

  it('addDays 加减天数并跨月', () => {
    expect(addDays('2026-05-24', 1)).toBe('2026-05-25')
    expect(addDays('2026-05-24', -1)).toBe('2026-05-23')
    expect(addDays('2026-04-30', 1)).toBe('2026-05-01')
    expect(addDays('2026-05-01', -1)).toBe('2026-04-30')
  })
})

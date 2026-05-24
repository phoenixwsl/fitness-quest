import { describe, it, expect } from 'vitest'
import {
  stiffnessScore,
  waistSeries,
  weightSeries,
  stiffnessSeries,
  completionRate,
  currentStreak,
  weeklySummary,
} from './trends'
import type { CheckIn, Metric } from '../types'

function ci(date: string, over: Partial<CheckIn> = {}): CheckIn {
  return {
    date,
    trainingStatus: 'done',
    activityTags: [],
    dietRating: 'good',
    water: 'enough',
    stiffness: 'none',
    pain: 0,
    energy: 'mid',
    mood: 3,
    redFlag: false,
    photoIds: [],
    isBackfill: false,
    createdAt: 1,
    ...over,
  }
}

describe('trends', () => {
  it('stiffnessScore 映射档位到 0..3', () => {
    expect(stiffnessScore('none')).toBe(0)
    expect(stiffnessScore('lt30')).toBe(1)
    expect(stiffnessScore('30to60')).toBe(2)
    expect(stiffnessScore('gt60')).toBe(3)
  })

  it('waistSeries / weightSeries 仅取有值项并按日期升序', () => {
    const metrics: Metric[] = [
      { date: '2026-05-22', waist: 91 },
      { date: '2026-05-20', waist: 92, weight: 83 },
      { date: '2026-05-21' }, // 无 waist/weight,跳过
    ]
    expect(waistSeries(metrics)).toEqual([
      { date: '2026-05-20', value: 92 },
      { date: '2026-05-22', value: 91 },
    ])
    expect(weightSeries(metrics)).toEqual([{ date: '2026-05-20', value: 83 }])
  })

  it('stiffnessSeries 按日期升序映射档位', () => {
    const s = stiffnessSeries([ci('2026-05-22', { stiffness: 'gt60' }), ci('2026-05-21', { stiffness: 'lt30' })])
    expect(s).toEqual([
      { date: '2026-05-21', value: 1 },
      { date: '2026-05-22', value: 3 },
    ])
  })

  it('completionRate:done=1 partial=0.5 skipped=0,休息日不计;无可计入日返回 null', () => {
    expect(completionRate([])).toBeNull()
    expect(completionRate([ci('1', { trainingStatus: 'restday' })])).toBeNull()
    const r = completionRate([
      ci('1', { trainingStatus: 'done' }),
      ci('2', { trainingStatus: 'partial' }),
      ci('3', { trainingStatus: 'skipped' }),
      ci('4', { trainingStatus: 'restday' }),
    ])
    expect(r).toBeCloseTo((1 + 0.5 + 0) / 3)
  })

  it('currentStreak:从今天往前数连续打卡;今天没打卡则从昨天算起', () => {
    const ins = [ci('2026-05-22'), ci('2026-05-23'), ci('2026-05-24')]
    expect(currentStreak(ins, '2026-05-24')).toBe(3)
    // 今天(25)还没打卡 → 从 24 起算,仍是 3
    expect(currentStreak(ins, '2026-05-25')).toBe(3)
    // 断了(缺 23)
    expect(currentStreak([ci('2026-05-22'), ci('2026-05-24')], '2026-05-24')).toBe(1)
  })

  it('weeklySummary 统计近 7 天打卡与训练,文案不惩罚', () => {
    const week = [
      ci('2026-05-24', { trainingStatus: 'done' }),
      ci('2026-05-23', { trainingStatus: 'partial' }),
      ci('2026-05-20', { trainingStatus: 'skipped' }),
      ci('2026-05-10'), // 7 天外,不计
    ]
    const s = weeklySummary(week, '2026-05-24')
    expect(s.checkInDays).toBe(3)
    expect(s.trainingDays).toBe(2)
    expect(s.text.length).toBeGreaterThan(0)

    const empty = weeklySummary([], '2026-05-24')
    expect(empty.checkInDays).toBe(0)
    expect(empty.text).toMatch(/打卡|开始/)
  })
})

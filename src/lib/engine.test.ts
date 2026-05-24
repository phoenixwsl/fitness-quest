import { describe, it, expect } from 'vitest'
import { classifyBand, decideNextType, buildEngineInput } from './engine'
import type { CheckIn, DailyPlan, Energy, PlanType, Stiffness, TrainingStatus } from '../types'

function band(stiffness: Stiffness, pain: number, energy: Energy) {
  return classifyBand({ stiffness, pain, energy })
}

function ci(
  date: string,
  trainingStatus: TrainingStatus,
  sym: { stiffness?: Stiffness; pain?: number; energy?: Energy; redFlag?: boolean } = {},
): CheckIn {
  return {
    date,
    trainingStatus,
    activityTags: [],
    dietRating: 'ok',
    water: 'enough',
    stiffness: sym.stiffness ?? 'none',
    pain: sym.pain ?? 0,
    energy: sym.energy ?? 'mid',
    mood: 3,
    redFlag: sym.redFlag ?? false,
    photoIds: [],
    isBackfill: false,
    createdAt: 0,
  }
}

function dp(date: string, type: PlanType): DailyPlan {
  return { date, type, reason: '' }
}

describe('classifyBand (§5.2)', () => {
  it('红档:晨僵 >60min 或 疼痛 ≥6', () => {
    expect(band('gt60', 0, 'high')).toBe('red')
    expect(band('none', 6, 'high')).toBe('red')
    expect(band('none', 9, 'high')).toBe('red')
  })

  it('黄档:晨僵 30–60min 或 疼痛 3–5 或 能量低', () => {
    expect(band('30to60', 0, 'high')).toBe('yellow')
    expect(band('none', 3, 'high')).toBe('yellow')
    expect(band('none', 5, 'high')).toBe('yellow')
    expect(band('none', 0, 'low')).toBe('yellow')
  })

  it('绿档:晨僵 <30min/无、疼痛 ≤2、能量正常', () => {
    expect(band('none', 0, 'high')).toBe('green')
    expect(band('lt30', 2, 'mid')).toBe('green')
  })

  it('边界:疼痛 5→黄,6→红;晨僵 lt30→绿,30to60→黄,gt60→红', () => {
    expect(band('none', 5, 'mid')).toBe('yellow')
    expect(band('none', 6, 'mid')).toBe('red')
    expect(band('lt30', 0, 'mid')).toBe('green')
    expect(band('30to60', 0, 'mid')).toBe('yellow')
    expect(band('gt60', 0, 'mid')).toBe('red')
  })
})

describe('decideNextType (§5.3 按序命中即停)', () => {
  const base = { band: 'green' as const, redFlag: false, consecutiveTrainingDays: 0, weeklyStrengthCount: 0, lastStrengthVariant: null }

  it('规则1 红旗优先于一切 → 休息 + 就医', () => {
    const out = decideNextType({ ...base, redFlag: true, band: 'green', lastStrengthVariant: 'B' })
    expect(out.type).toBe('rest')
    expect(out.reason).toMatch(/红旗|就医/)
  })

  it('规则1 红旗即使红档也休息', () => {
    expect(decideNextType({ ...base, redFlag: true, band: 'red' }).type).toBe('rest')
  })

  it('规则2 红档 → 恢复日', () => {
    const out = decideNextType({ ...base, band: 'red' })
    expect(out.type).toBe('recovery')
    expect(out.reason).toMatch(/红档|恢复/)
  })

  it('规则3 黄档 → 体态/活动度日', () => {
    const out = decideNextType({ ...base, band: 'yellow' })
    expect(out.type).toBe('mobility')
    expect(out.reason).toMatch(/黄档|体态|活动度/)
  })

  it('规则4 绿档 + 连续训练≥2 → 恢复', () => {
    const out = decideNextType({ ...base, band: 'green', consecutiveTrainingDays: 2 })
    expect(out.type).toBe('recovery')
    expect(out.reason).toMatch(/连续训练/)
  })

  it('规则5 绿档 + 本周力量≥3 → 体态/活动度', () => {
    const out = decideNextType({ ...base, band: 'green', weeklyStrengthCount: 3 })
    expect(out.type).toBe('mobility')
    expect(out.reason).toMatch(/本周力量/)
  })

  it('规则6 绿档其余 → 力量 A/B 轮换', () => {
    expect(decideNextType({ ...base, lastStrengthVariant: null }).type).toBe('strengthA')
    expect(decideNextType({ ...base, lastStrengthVariant: 'A' }).type).toBe('strengthB')
    expect(decideNextType({ ...base, lastStrengthVariant: 'B' }).type).toBe('strengthA')
  })

  it('规则4 先于规则5/6:绿档连续2天即使本周力量0也排恢复', () => {
    expect(
      decideNextType({ ...base, consecutiveTrainingDays: 2, weeklyStrengthCount: 0 }).type,
    ).toBe('recovery')
  })
})

describe('buildEngineInput (从历史装配)', () => {
  it('连续训练天数:训练日且完成才计,遇恢复/休息/未做中断', () => {
    const plans = [
      dp('2026-05-21', 'recovery'),
      dp('2026-05-22', 'strengthB'),
      dp('2026-05-23', 'mobility'),
      dp('2026-05-24', 'strengthA'),
    ]
    const checks = [
      ci('2026-05-21', 'restday'),
      ci('2026-05-22', 'done'),
      ci('2026-05-23', 'done'),
      ci('2026-05-24', 'done'),
    ]
    expect(buildEngineInput(checks, plans, '2026-05-24').consecutiveTrainingDays).toBe(3)
  })

  it('连续训练天数:今日训练日但未做 → 从今日中断', () => {
    const plans = [dp('2026-05-23', 'strengthA'), dp('2026-05-24', 'strengthB')]
    const checks = [ci('2026-05-23', 'done'), ci('2026-05-24', 'skipped')]
    expect(buildEngineInput(checks, plans, '2026-05-24').consecutiveTrainingDays).toBe(0)
  })

  it('本周力量次数:近 7 天内完成的力量日', () => {
    const plans = [
      dp('2026-05-17', 'strengthA'), // 窗口外(asOf-7)
      dp('2026-05-18', 'strengthB'), // 窗口内(asOf-6)
      dp('2026-05-20', 'strengthA'),
      dp('2026-05-22', 'strengthB'),
      dp('2026-05-23', 'strengthA'), // 未做,不计
      dp('2026-05-24', 'strengthA'),
    ]
    const checks = [
      ci('2026-05-17', 'done'),
      ci('2026-05-18', 'done'),
      ci('2026-05-20', 'done'),
      ci('2026-05-22', 'done'),
      ci('2026-05-23', 'skipped'),
      ci('2026-05-24', 'done'),
    ]
    expect(buildEngineInput(checks, plans, '2026-05-24').weeklyStrengthCount).toBe(4)
  })

  it('lastStrengthVariant:最近一条力量日的 A/B;无则 null', () => {
    const plans = [dp('2026-05-20', 'strengthA'), dp('2026-05-22', 'strengthB'), dp('2026-05-23', 'mobility')]
    const checks = [ci('2026-05-20', 'done'), ci('2026-05-22', 'done'), ci('2026-05-23', 'done')]
    expect(buildEngineInput(checks, plans, '2026-05-24').lastStrengthVariant).toBe('B')
    expect(buildEngineInput([], [], '2026-05-24').lastStrengthVariant).toBeNull()
  })

  it('band 与 redFlag 取自 asOfDate 当天复盘', () => {
    const checks = [ci('2026-05-24', 'done', { pain: 7, redFlag: true })]
    const input = buildEngineInput(checks, [], '2026-05-24')
    expect(input.band).toBe('red')
    expect(input.redFlag).toBe(true)
  })
})

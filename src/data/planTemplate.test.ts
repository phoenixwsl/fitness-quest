import { describe, it, expect } from 'vitest'
import { WEEK_PLAN, getPlanForDayIndex } from './planTemplate'
import type { PlanType } from '../types'

describe('static weekly plan template', () => {
  it('有 7 天,dayIndex 依次为 0..6', () => {
    expect(WEEK_PLAN).toHaveLength(7)
    WEEK_PLAN.forEach((d, i) => expect(d.dayIndex).toBe(i))
  })

  it('类型序列符合设计文档 §6.4', () => {
    const seq: PlanType[] = [
      'strengthA',
      'mobility',
      'strengthB',
      'recovery',
      'strengthA',
      'mobility',
      'rest',
    ]
    expect(WEEK_PLAN.map((d) => d.type)).toEqual(seq)
  })

  it('每天都有晚间体态与最低版本(永不归零)', () => {
    for (const d of WEEK_PLAN) {
      expect(d.eveningMobility.length).toBeGreaterThan(0)
      expect(d.minimumVersion.trim().length).toBeGreaterThan(0)
      expect(d.diet.trim().length).toBeGreaterThan(0)
      expect(d.water.trim().length).toBeGreaterThan(0)
    }
  })

  it('力量日有主训练动作;休息日无早训动作', () => {
    const byType = (t: PlanType) => WEEK_PLAN.filter((d) => d.type === t)
    for (const d of [...byType('strengthA'), ...byType('strengthB')]) {
      expect(d.main.length).toBeGreaterThan(0)
    }
    expect(byType('rest')[0].main).toHaveLength(0)
  })

  it('力量 A 含高脚杯深蹲,力量 B 含分腿蹲', () => {
    const a = WEEK_PLAN.find((d) => d.type === 'strengthA')!
    const b = WEEK_PLAN.find((d) => d.type === 'strengthB')!
    expect(a.main.some((e) => e.name.includes('高脚杯深蹲'))).toBe(true)
    expect(b.main.some((e) => e.name.includes('分腿蹲'))).toBe(true)
  })

  it('AS 安全:任何动作都不含被禁关键字', () => {
    const banned = ['swing', '摆动', '卷腹', '仰卧起坐', '硬拉', '过头推举', '大重量深蹲', '跑跳']
    const allNames = WEEK_PLAN.flatMap((d) => d.main.map((e) => `${e.name} ${e.prescription} ${e.note ?? ''}`))
    for (const text of allNames) {
      for (const bad of banned) {
        expect(text).not.toContain(bad)
      }
    }
  })

  it('每个力量日都带「锐痛即停」安全提示', () => {
    const strengthDays = WEEK_PLAN.filter((d) => d.type === 'strengthA' || d.type === 'strengthB')
    for (const d of strengthDays) {
      expect(d.safetyNote).toContain('锐痛')
    }
  })

  it('getPlanForDayIndex 对越界索引取模', () => {
    expect(getPlanForDayIndex(7)).toBe(getPlanForDayIndex(0))
    expect(getPlanForDayIndex(9)).toBe(getPlanForDayIndex(2))
    expect(getPlanForDayIndex(-1)).toBe(getPlanForDayIndex(6))
  })
})

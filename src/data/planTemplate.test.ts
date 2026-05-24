import { describe, it, expect } from 'vitest'
import { TYPE_CYCLE, getTypeForDayIndex, getPlanForType, TIME_OF_DAY } from './planTemplate'
import type { PlanType, TimeOfDay } from '../types'

const ALL_TYPES: PlanType[] = ['strengthA', 'strengthB', 'mobility', 'recovery', 'rest']
const STRENGTH: PlanType[] = ['strengthA', 'strengthB']
const BANNED = ['swing', '摆动', '卷腹', '仰卧起坐', '硬拉', '过头推举', '大重量深蹲', '跑跳']

describe('TYPE_CYCLE / getTypeForDayIndex', () => {
  it('7 天序列符合设计文档 §6.4', () => {
    expect(TYPE_CYCLE).toEqual([
      'strengthA',
      'mobility',
      'strengthB',
      'recovery',
      'strengthA',
      'mobility',
      'rest',
    ])
  })

  it('getTypeForDayIndex 对越界索引取模', () => {
    expect(getTypeForDayIndex(0)).toBe('strengthA')
    expect(getTypeForDayIndex(2)).toBe('strengthB')
    expect(getTypeForDayIndex(6)).toBe('rest')
    expect(getTypeForDayIndex(7)).toBe('strengthA')
    expect(getTypeForDayIndex(-1)).toBe('rest')
  })
})

describe('getPlanForType', () => {
  it('每个类型都有晚间体态/最低版本/饮食/喝水(永不归零)', () => {
    for (const t of ALL_TYPES) {
      const p = getPlanForType(t)
      expect(p.eveningMobility.length).toBeGreaterThan(0)
      expect(p.minimumVersion.trim().length).toBeGreaterThan(0)
      expect(p.diet.trim().length).toBeGreaterThan(0)
      expect(p.water.trim().length).toBeGreaterThan(0)
    }
  })

  it('sessionTitle 时间中性(不含时间段前缀)', () => {
    for (const t of ALL_TYPES) {
      const title = getPlanForType(t).sessionTitle
      for (const word of ['早上', '上午', '下午', '晚上']) {
        expect(title).not.toContain(word)
      }
    }
  })

  it('力量日有 equipped 与 bodyweight 两套,各非空', () => {
    for (const t of STRENGTH) {
      const p = getPlanForType(t)
      expect(p.main.equipped.length).toBeGreaterThan(0)
      expect(p.main.bodyweight.length).toBeGreaterThan(0)
    }
  })

  it('力量 A:有器械含高脚杯深蹲;徒手含自重深蹲与俯卧 YTW', () => {
    const a = getPlanForType('strengthA')
    expect(a.main.equipped.some((e) => e.name.includes('高脚杯深蹲'))).toBe(true)
    expect(a.main.bodyweight.some((e) => e.name.includes('自重深蹲'))).toBe(true)
    expect(a.main.bodyweight.some((e) => e.name.includes('YTW'))).toBe(true)
  })

  it('力量 B:有器械含哑铃地面卧推;徒手含温和 superman', () => {
    const b = getPlanForType('strengthB')
    expect(b.main.equipped.some((e) => e.name.includes('地面卧推'))).toBe(true)
    expect(b.main.bodyweight.some((e) => e.name.includes('superman'))).toBe(true)
  })

  it('活动度/恢复日 有无器械共用同一清单', () => {
    for (const t of ['mobility', 'recovery'] as PlanType[]) {
      const p = getPlanForType(t)
      expect(p.main.equipped).toEqual(p.main.bodyweight)
      expect(p.main.equipped.length).toBeGreaterThan(0)
    }
  })

  it('休息日无早训动作', () => {
    const r = getPlanForType('rest')
    expect(r.main.equipped).toHaveLength(0)
    expect(r.main.bodyweight).toHaveLength(0)
  })

  it('力量日带「锐痛」安全提示', () => {
    for (const t of STRENGTH) {
      expect(getPlanForType(t).safetyNote).toContain('锐痛')
    }
  })

  it('AS 安全:任何动作(两套)都不含被禁关键字', () => {
    for (const t of ALL_TYPES) {
      const p = getPlanForType(t)
      const texts = [...p.main.equipped, ...p.main.bodyweight].map(
        (e) => `${e.name} ${e.prescription} ${e.note ?? ''}`,
      )
      for (const text of texts) {
        for (const bad of BANNED) {
          expect(text).not.toContain(bad)
        }
      }
    }
  })
})

describe('TIME_OF_DAY', () => {
  it('三个时间段齐全,各有 label 与 tip', () => {
    for (const t of ['morning', 'afternoon', 'evening'] as TimeOfDay[]) {
      expect(TIME_OF_DAY[t].label.length).toBeGreaterThan(0)
      expect(TIME_OF_DAY[t].tip.length).toBeGreaterThan(0)
      expect(Array.isArray(TIME_OF_DAY[t].warmupExtra)).toBe(true)
    }
  })

  it('上午晨僵起步更慢:有额外热身', () => {
    expect(TIME_OF_DAY.morning.warmupExtra.length).toBeGreaterThan(0)
  })
})

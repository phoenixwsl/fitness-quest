import { describe, it, expect } from 'vitest'
import { EXERCISE_LIBRARY, getExercise } from './exerciseLibrary'
import { getPlanForType } from './planTemplate'
import type { PlanType } from '../types'

const TYPES: PlanType[] = ['strengthA', 'strengthB', 'mobility', 'recovery', 'rest']
const BANNED = ['swing', '摆动', '卷腹', '仰卧起坐', '硬拉', '过头推举', '大重量深蹲', '跑跳']

describe('exerciseLibrary', () => {
  it('覆盖 planTemplate 里所有 exerciseId', () => {
    for (const t of TYPES) {
      const p = getPlanForType(t)
      for (const item of [...p.main.equipped, ...p.main.bodyweight]) {
        expect(getExercise(item.exerciseId), `缺少动作库条目: ${item.exerciseId}`).toBeDefined()
      }
    }
  })

  it('每条动作的详情字段非空', () => {
    for (const ex of EXERCISE_LIBRARY) {
      expect(ex.name).toBeTruthy()
      expect(ex.target).toBeTruthy()
      expect(ex.steps.length).toBeGreaterThan(0)
      expect(ex.cues.length).toBeGreaterThan(0)
      expect(ex.mistakes.length).toBeGreaterThan(0)
      expect(ex.asSafety).toBeTruthy()
      expect(ex.alternative).toBeTruthy()
    }
  })

  it('id 唯一', () => {
    const ids = EXERCISE_LIBRARY.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('AS 安全:库内无被禁关键字', () => {
    for (const ex of EXERCISE_LIBRARY) {
      const blob = JSON.stringify(ex)
      for (const bad of BANNED) {
        expect(blob, `${ex.id} 含被禁关键字 ${bad}`).not.toContain(bad)
      }
    }
  })

  it('getExercise 未知 id 返回 undefined', () => {
    expect(getExercise('does-not-exist')).toBeUndefined()
  })
})

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
      // 只扫中文字段(英文镜像由下面的英文用例单独覆盖,避免「避免摆动」类警告误伤)。
      const blob = JSON.stringify(ex, (k, v) => (k === 'en' ? undefined : v))
      for (const bad of BANNED) {
        expect(blob, `${ex.id} 含被禁关键字 ${bad}`).not.toContain(bad)
      }
    }
  })

  it('getExercise 未知 id 返回 undefined', () => {
    expect(getExercise('does-not-exist')).toBeUndefined()
  })

  it('每条动作含完整英文镜像', () => {
    for (const ex of EXERCISE_LIBRARY) {
      expect(ex.en.name, `${ex.id} 缺 en.name`).toBeTruthy()
      expect(ex.en.target, `${ex.id} 缺 en.target`).toBeTruthy()
      expect(ex.en.steps.length, `${ex.id} 缺 en.steps`).toBeGreaterThan(0)
      expect(ex.en.cues.length, `${ex.id} 缺 en.cues`).toBeGreaterThan(0)
      expect(ex.en.mistakes.length, `${ex.id} 缺 en.mistakes`).toBeGreaterThan(0)
      expect(ex.en.asSafety, `${ex.id} 缺 en.asSafety`).toBeTruthy()
      expect(ex.en.alternative, `${ex.id} 缺 en.alternative`).toBeTruthy()
    }
  })

  it('AS 安全:英文内容无被禁动作名(英文等价)', () => {
    // 用具体被禁「动作名」,而非裸词——避免命中「avoid jumping / no swinging」这类安全警告。
    const BANNED_EN = [
      'kettlebell swing',
      'sit-up',
      'sit up',
      'crunch',
      'deadlift',
      'overhead press',
      'box jump',
      'jump squat',
      'jumping jack',
    ]
    for (const ex of EXERCISE_LIBRARY) {
      const blob = JSON.stringify(ex.en).toLowerCase()
      for (const bad of BANNED_EN) {
        expect(blob, `${ex.id} 英文含被禁动作名 ${bad}`).not.toContain(bad)
      }
    }
  })
})

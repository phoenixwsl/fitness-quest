import { describe, it, expect } from 'vitest'
import { getExerciseDiagram } from './exerciseDiagrams'

describe('exerciseDiagrams', () => {
  it('有 SVG 的动作返回图片 URL', () => {
    // goblet-squat.svg 占位图存在
    expect(typeof getExerciseDiagram('goblet-squat')).toBe('string')
  })

  it('没有 SVG 的动作返回 undefined(优雅降级)', () => {
    expect(getExerciseDiagram('does-not-exist')).toBeUndefined()
    expect(getExerciseDiagram('rest')).toBeUndefined()
  })
})

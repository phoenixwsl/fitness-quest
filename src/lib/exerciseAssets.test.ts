import { describe, it, expect } from 'vitest'
import { getExerciseSvg, getWgerImage } from './exerciseAssets'
import { EXERCISE_LIBRARY, isWgerImageCandidate } from '../data/exerciseLibrary'

describe('exerciseAssets', () => {
  it('每个动作都有简笔示意图(必备主视觉)', () => {
    for (const ex of EXERCISE_LIBRARY) {
      expect(getExerciseSvg(ex.id), `${ex.id} 缺 SVG`).toBeTruthy()
    }
  })

  it('未知 id 的示意图返回 undefined(优雅降级)', () => {
    expect(getExerciseSvg('does-not-exist')).toBeUndefined()
  })

  it('wger 图只可能挂在被标记为 candidate 的动作上,且带署名', () => {
    for (const ex of EXERCISE_LIBRARY) {
      const w = getWgerImage(ex.id)
      if (w) {
        expect(isWgerImageCandidate(ex.id), `${ex.id} 非 candidate 却有 wger 图`).toBe(true)
        expect(w.src).toBeTruthy()
        expect(w.license).toBe('CC-BY-SA 3.0')
      }
    }
  })
})

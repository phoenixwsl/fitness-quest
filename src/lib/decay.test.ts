import { describe, it, expect } from 'vitest'
import { shouldCollapse, COLLAPSE_THRESHOLD } from './decay'

describe('详细度衰减 shouldCollapse', () => {
  it('未达阈值默认展开(不折叠)', () => {
    expect(shouldCollapse(0)).toBe(false)
    expect(shouldCollapse(COLLAPSE_THRESHOLD - 1)).toBe(false)
  })

  it('达到阈值后折叠', () => {
    expect(shouldCollapse(COLLAPSE_THRESHOLD)).toBe(true)
    expect(shouldCollapse(COLLAPSE_THRESHOLD + 3)).toBe(true)
  })

  it('阈值默认为 5', () => {
    expect(COLLAPSE_THRESHOLD).toBe(5)
    expect(shouldCollapse(4)).toBe(false)
    expect(shouldCollapse(5)).toBe(true)
  })
})

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { render, screen } from '@testing-library/react'
import TodayPage from './TodayPage'
import { todayKey } from '../lib/date'

vi.mock('../db', () => ({ getAnchorDate: vi.fn() }))
import { getAnchorDate } from '../db'

// 锚点设为「今天 - idx 天」,使 planDayIndex 落在指定 idx(0..6)。
function anchorForIndex(idx: number): string {
  const d = new Date()
  d.setDate(d.getDate() - idx)
  return todayKey(d)
}

beforeEach(() => {
  ;(getAnchorDate as Mock).mockReset()
})

describe('TodayPage', () => {
  it('渲染今日日期', async () => {
    ;(getAnchorDate as Mock).mockResolvedValue(anchorForIndex(0))
    render(<TodayPage />)
    expect(await screen.findByText(new RegExp(todayKey()))).toBeInTheDocument()
  })

  it('力量 A 日:显示高脚杯深蹲与组数', async () => {
    ;(getAnchorDate as Mock).mockResolvedValue(anchorForIndex(0))
    render(<TodayPage />)
    expect(await screen.findByText('高脚杯深蹲')).toBeInTheDocument()
    expect(screen.getByText('3 × 10')).toBeInTheDocument()
  })

  it('显示晚间体态放松区块', async () => {
    ;(getAnchorDate as Mock).mockResolvedValue(anchorForIndex(0))
    render(<TodayPage />)
    expect(await screen.findByText('晚间体态放松')).toBeInTheDocument()
    expect(screen.getByText(/靠墙天使/)).toBeInTheDocument()
  })

  it('显示饮食与喝水提示', async () => {
    ;(getAnchorDate as Mock).mockResolvedValue(anchorForIndex(0))
    render(<TodayPage />)
    expect(await screen.findByText(/餐盘法/)).toBeInTheDocument()
    expect(screen.getByText(/2–2.5L/)).toBeInTheDocument()
  })

  it('显示「最低版本」兜底', async () => {
    ;(getAnchorDate as Mock).mockResolvedValue(anchorForIndex(0))
    render(<TodayPage />)
    expect(await screen.findByText('最低版本')).toBeInTheDocument()
  })

  it('力量日显示「锐痛即停」安全提示', async () => {
    ;(getAnchorDate as Mock).mockResolvedValue(anchorForIndex(0))
    render(<TodayPage />)
    expect(await screen.findByText(/锐痛即停/)).toBeInTheDocument()
  })

  it('休息日:显示休息且不渲染早训动作', async () => {
    ;(getAnchorDate as Mock).mockResolvedValue(anchorForIndex(6))
    render(<TodayPage />)
    expect(await screen.findByText(/今天休息/)).toBeInTheDocument()
    expect(screen.queryByText('高脚杯深蹲')).not.toBeInTheDocument()
  })
})

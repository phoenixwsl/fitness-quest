import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TodayPage from './TodayPage'
import { todayKey } from '../lib/date'
import type { Scenario } from '../types'

vi.mock('../db', () => ({
  getAnchorDate: vi.fn(),
  getScenario: vi.fn(),
  putScenario: vi.fn().mockResolvedValue(undefined),
}))
import { getAnchorDate, getScenario, putScenario } from '../db'

// 锚点 = 今天 - idx 天 → planDayIndex 落在 idx;idx0=力量A,idx6=休息。
function anchorForIndex(idx: number): string {
  const d = new Date()
  d.setDate(d.getDate() - idx)
  return todayKey(d)
}

beforeEach(() => {
  ;(getAnchorDate as Mock).mockReset()
  ;(getScenario as Mock).mockReset()
  ;(putScenario as Mock).mockReset().mockResolvedValue(undefined)
})

function setup(idx: number, scenario: Scenario | undefined) {
  ;(getAnchorDate as Mock).mockResolvedValue(anchorForIndex(idx))
  ;(getScenario as Mock).mockResolvedValue(scenario)
}

describe('TodayPage 场景流程', () => {
  it('无场景时显示场景选择器', async () => {
    setup(0, undefined)
    render(<TodayPage />)
    expect(await screen.findByText('选择场景')).toBeInTheDocument()
  })

  it('选「下午 + 有器械」渲染力量A有器械清单并存场景', async () => {
    setup(0, undefined)
    render(<TodayPage />)
    fireEvent.click(await screen.findByRole('button', { name: '开始训练' }))
    expect(await screen.findByText('高脚杯深蹲')).toBeInTheDocument()
    expect(screen.getByText(/下午 · 主训练/)).toBeInTheDocument()
    expect(putScenario).toHaveBeenCalledWith({
      date: todayKey(),
      timeOfDay: 'afternoon',
      equipment: 'equipped',
    })
  })

  it('选「无器械」渲染徒手清单', async () => {
    setup(0, undefined)
    render(<TodayPage />)
    fireEvent.click(await screen.findByRole('radio', { name: '无器械' }))
    fireEvent.click(screen.getByRole('button', { name: '开始训练' }))
    expect(await screen.findByText('自重深蹲')).toBeInTheDocument()
    expect(screen.queryByText('高脚杯深蹲')).not.toBeInTheDocument()
  })

  it('上午场景显示晨僵提示', async () => {
    setup(0, undefined)
    render(<TodayPage />)
    fireEvent.click(await screen.findByRole('radio', { name: '上午' }))
    fireEvent.click(screen.getByRole('button', { name: '开始训练' }))
    expect(await screen.findByText(/上午常有晨僵/)).toBeInTheDocument()
  })

  it('已有当天场景时直接渲染,且可重选场景', async () => {
    setup(0, { date: todayKey(), timeOfDay: 'afternoon', equipment: 'equipped' })
    render(<TodayPage />)
    expect(await screen.findByText('高脚杯深蹲')).toBeInTheDocument()
    expect(screen.queryByText('选择场景')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '重选场景' }))
    expect(await screen.findByText('选择场景')).toBeInTheDocument()
  })

  it('渲染晚间体态 / 饮食喝水 / 最低版本', async () => {
    setup(0, { date: todayKey(), timeOfDay: 'afternoon', equipment: 'equipped' })
    render(<TodayPage />)
    expect(await screen.findByText('晚间体态放松')).toBeInTheDocument()
    expect(screen.getByText(/餐盘法/)).toBeInTheDocument()
    expect(screen.getByText('最低版本')).toBeInTheDocument()
  })

  it('休息日显示休息且无早训动作', async () => {
    setup(6, { date: todayKey(), timeOfDay: 'evening', equipment: 'bodyweight' })
    render(<TodayPage />)
    expect(await screen.findByText(/今天休息/)).toBeInTheDocument()
    expect(screen.queryByText('高脚杯深蹲')).not.toBeInTheDocument()
  })
})

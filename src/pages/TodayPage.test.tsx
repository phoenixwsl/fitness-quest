import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TodayPage from './TodayPage'
import { todayKey } from '../lib/date'
import type { PlanType, Scenario } from '../types'

vi.mock('../db', () => ({
  getDailyPlan: vi.fn(),
  getScenario: vi.fn(),
  putScenario: vi.fn().mockResolvedValue(undefined),
  getAllCounts: vi.fn().mockResolvedValue({}),
}))
import { getDailyPlan, getScenario, putScenario, getAllCounts } from '../db'

beforeEach(() => {
  ;(getDailyPlan as Mock).mockReset()
  ;(getScenario as Mock).mockReset()
  ;(putScenario as Mock).mockReset().mockResolvedValue(undefined)
  ;(getAllCounts as Mock).mockReset().mockResolvedValue({})
})

// type=null 模拟「无当日计划」(引擎未生成 / 漏复盘)。
function setup(type: PlanType | null, scenario: Scenario | undefined) {
  ;(getDailyPlan as Mock).mockResolvedValue(
    type ? { date: todayKey(), type, reason: '状态稳定 → 力量 A(A/B 轮换)' } : undefined,
  )
  ;(getScenario as Mock).mockResolvedValue(scenario)
}

describe('TodayPage 场景流程', () => {
  it('无场景时显示场景选择器', async () => {
    setup('strengthA', undefined)
    render(<TodayPage />)
    expect(await screen.findByText('选择场景')).toBeInTheDocument()
  })

  it('选「下午 + 有器械」渲染力量A有器械清单并存场景', async () => {
    setup('strengthA', undefined)
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
    setup('strengthA', undefined)
    render(<TodayPage />)
    fireEvent.click(await screen.findByRole('radio', { name: '无器械' }))
    fireEvent.click(screen.getByRole('button', { name: '开始训练' }))
    expect(await screen.findByText('自重深蹲')).toBeInTheDocument()
    expect(screen.queryByText('高脚杯深蹲')).not.toBeInTheDocument()
  })

  it('上午场景显示晨僵提示', async () => {
    setup('strengthA', undefined)
    render(<TodayPage />)
    fireEvent.click(await screen.findByRole('radio', { name: '上午' }))
    fireEvent.click(screen.getByRole('button', { name: '开始训练' }))
    expect(await screen.findByText(/上午常有晨僵/)).toBeInTheDocument()
  })

  it('已有当天场景时直接渲染,且可重选场景', async () => {
    setup('strengthA', { date: todayKey(), timeOfDay: 'afternoon', equipment: 'equipped' })
    render(<TodayPage />)
    expect(await screen.findByText('高脚杯深蹲')).toBeInTheDocument()
    expect(screen.queryByText('选择场景')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '重选场景' }))
    expect(await screen.findByText('选择场景')).toBeInTheDocument()
  })

  it('显示引擎生成理由', async () => {
    setup('strengthA', { date: todayKey(), timeOfDay: 'afternoon', equipment: 'equipped' })
    render(<TodayPage />)
    expect(await screen.findByText(/状态稳定 → 力量 A/)).toBeInTheDocument()
  })

  it('新手期动作详情默认展开(显示要领)', async () => {
    ;(getAllCounts as Mock).mockResolvedValue({})
    setup('strengthA', { date: todayKey(), timeOfDay: 'afternoon', equipment: 'equipped' })
    render(<TodayPage />)
    expect(await screen.findByText(/重心落在全脚掌/)).toBeInTheDocument()
  })

  it('渲染晚间体态 / 饮食喝水 / 最低版本', async () => {
    setup('strengthA', { date: todayKey(), timeOfDay: 'afternoon', equipment: 'equipped' })
    render(<TodayPage />)
    expect(await screen.findByText('晚间体态放松')).toBeInTheDocument()
    expect(screen.getByText(/餐盘法/)).toBeInTheDocument()
    expect(screen.getByText('最低版本')).toBeInTheDocument()
  })

  it('休息日显示休息且无早训动作', async () => {
    setup('rest', { date: todayKey(), timeOfDay: 'evening', equipment: 'bodyweight' })
    render(<TodayPage />)
    expect(await screen.findByText(/今天休息/)).toBeInTheDocument()
    expect(screen.queryByText('高脚杯深蹲')).not.toBeInTheDocument()
  })

  it('无当日计划时兜底体态 / 活动度日', async () => {
    setup(null, { date: todayKey(), timeOfDay: 'afternoon', equipment: 'equipped' })
    render(<TodayPage />)
    // 兜底 mobility → 渲染活动度动作 + 兜底理由
    expect(await screen.findByText('温和猫牛')).toBeInTheDocument()
    expect(screen.getByText(/暂无昨日复盘/)).toBeInTheDocument()
  })
})

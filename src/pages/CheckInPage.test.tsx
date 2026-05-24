import { describe, it, expect, beforeEach, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { render, screen, fireEvent } from '@testing-library/react'
import { addDays, todayKey } from '../lib/date'

// 全新库 + 重置模块,保证 db 单例与数据隔离。
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  vi.resetModules()
})

async function renderPage() {
  const { default: CheckInPage } = await import('./CheckInPage')
  render(<CheckInPage />)
  // 等表单加载完成(挂载时会查今日是否已打卡)
  await screen.findByText('今日训练')
}

async function db() {
  return import('../db')
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: '完成复盘打卡' }))
}

describe('CheckInPage', () => {
  it('渲染附录A 全部必填字段', async () => {
    await renderPage()
    for (const label of [
      '今日训练',
      '今日还做了什么',
      '饮食自评',
      '喝水',
      '晨僵时长',
      '疼痛程度',
      '能量水平',
      '心情',
      '红旗自检',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('填表提交后写入当天 checkIn', async () => {
    await renderPage()
    fireEvent.click(screen.getByRole('radio', { name: '部分完成' }))
    submit()
    await screen.findByText('明日计划')
    const got = await (await db()).getCheckIn(todayKey())
    expect(got?.trainingStatus).toBe('partial')
    expect(got?.isBackfill).toBe(false)
  })

  it('提交后显示引擎生成的明日计划卡 + 理由', async () => {
    await renderPage()
    submit() // 默认绿档、无红旗、无历史 → 引擎排力量 A
    expect(await screen.findByText('明日计划')).toBeInTheDocument()
    expect(screen.getByText('力量 A')).toBeInTheDocument()
    expect(screen.getByText(/为什么:/)).toBeInTheDocument()
    // 明日 dailyPlan 已落库
    const tmr = await (await db()).getDailyPlan(addDays(todayKey(), 1))
    expect(tmr?.type).toBe('strengthA')
  })

  it('勾选红旗自检提交后提示休息 + 就医', async () => {
    await renderPage()
    fireEvent.click(screen.getByRole('checkbox', { name: /出现上述红旗信号/ }))
    submit()
    expect(await screen.findByText('明日计划:休息')).toBeInTheDocument()
    expect(screen.getByText(/尽快就医/)).toBeInTheDocument()
  })

  it('填写腰围提交后写入 metrics', async () => {
    await renderPage()
    fireEvent.change(screen.getByLabelText('腰围(cm,选填)'), { target: { value: '90' } })
    submit()
    await screen.findByText('明日计划')
    const m = await (await db()).getMetric(todayKey())
    expect(m?.waist).toBe(90)
  })

  it('带照片提交后 checkIn 关联照片', async () => {
    await renderPage()
    const input = screen.getByLabelText('选择或拍摄照片')
    fireEvent.change(input, {
      target: { files: [new File(['x'], 'p.jpg', { type: 'image/jpeg' })] },
    })
    submit()
    await screen.findByText('明日计划')
    const got = await (await db()).getCheckIn(todayKey())
    expect(got?.photoIds).toHaveLength(1)
    expect(await (await db()).getPhoto(got!.photoIds[0])).toBeDefined()
  })

  it('完成打卡后今日动作完成次数 +1', async () => {
    // 今日类型来自 dailyPlan(today);预置为力量A,无场景 → 徒手版
    await (await db()).putDailyPlan({ date: todayKey(), type: 'strengthA', reason: '测试' })
    await renderPage()
    submit() // 默认训练状态 = 完成
    await screen.findByText('明日计划')
    expect(await (await db()).getCount('bw-squat')).toBe(1)
  })

  it('未做时不累加完成次数', async () => {
    await renderPage()
    fireEvent.click(screen.getByRole('radio', { name: '未做' }))
    submit()
    await screen.findByText('明日计划')
    expect(await (await db()).getCount('bw-squat')).toBe(0)
  })

  it('今日已打卡时显示已完成提示', async () => {
    const d = await db()
    await d.putCheckIn({
      date: todayKey(),
      trainingStatus: 'done',
      activityTags: [],
      dietRating: 'good',
      water: 'enough',
      stiffness: 'none',
      pain: 0,
      energy: 'mid',
      mood: 3,
      redFlag: false,
      photoIds: [],
      isBackfill: false,
      createdAt: 1,
    })
    const { default: CheckInPage } = await import('./CheckInPage')
    render(<CheckInPage />)
    expect(await screen.findByText(/今日已完成复盘/)).toBeInTheDocument()
  })
})

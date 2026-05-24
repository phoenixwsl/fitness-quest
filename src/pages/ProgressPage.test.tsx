import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProgressPage from './ProgressPage'
import type { Photo, PoseTag } from '../types'

vi.mock('../db', () => ({
  getAllPhotos: vi.fn(),
  getAllCheckIns: vi.fn().mockResolvedValue([]),
  getAllMetrics: vi.fn().mockResolvedValue([]),
  getSettings: vi.fn().mockResolvedValue({ anchorDate: '2026-05-20' }),
}))
import { getAllPhotos, getAllCheckIns, getAllMetrics } from '../db'
import type { CheckIn } from '../types'

function photo(id: string, takenAt: number, pose: PoseTag, date: string): Photo {
  return { id, blob: new Blob([id]), takenAt, pose, checkInDate: date }
}

function ci(date: string, over: Partial<CheckIn> = {}): CheckIn {
  return {
    date, trainingStatus: 'done', activityTags: [], dietRating: 'good', water: 'enough',
    stiffness: 'lt30', pain: 1, energy: 'mid', mood: 4, redFlag: false,
    photoIds: [], isBackfill: false, createdAt: 1, ...over,
  }
}

beforeEach(() => {
  ;(getAllPhotos as Mock).mockReset().mockResolvedValue([])
  ;(getAllCheckIns as Mock).mockResolvedValue([])
  ;(getAllMetrics as Mock).mockResolvedValue([])
})

describe('ProgressPage 照片时间线', () => {
  it('无照片时显示空态', async () => {
    ;(getAllPhotos as Mock).mockResolvedValue([])
    render(<ProgressPage />)
    expect(await screen.findByText(/还没有照片/)).toBeInTheDocument()
  })

  it('渲染照片缩略图(日期 + 姿势标签)', async () => {
    ;(getAllPhotos as Mock).mockResolvedValue([
      photo('p1', 200, 'front', '2026-05-24'),
      photo('p2', 100, 'side', '2026-05-22'),
    ])
    render(<ProgressPage />)
    expect(await screen.findByAltText('正面 2026-05-24')).toBeInTheDocument()
    expect(screen.getByAltText('侧面 2026-05-22')).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })

  it('选两张照片显示并排对比', async () => {
    ;(getAllPhotos as Mock).mockResolvedValue([
      photo('p1', 200, 'front', '2026-05-24'),
      photo('p2', 100, 'front', '2026-05-22'),
    ])
    render(<ProgressPage />)
    const thumbs = await screen.findAllByRole('button', { name: /正面/ })
    fireEvent.click(thumbs[0])
    fireEvent.click(thumbs[1])
    expect(await screen.findByRole('region', { name: '对比' })).toBeInTheDocument()
  })

  it('显示本周小结与趋势(有数据)', async () => {
    ;(getAllCheckIns as Mock).mockResolvedValue([ci('2026-05-23'), ci('2026-05-24', { stiffness: 'gt60' })])
    ;(getAllMetrics as Mock).mockResolvedValue([
      { date: '2026-05-22', waist: 92 },
      { date: '2026-05-24', waist: 91 },
    ])
    render(<ProgressPage />)
    expect(await screen.findByText('本周小结')).toBeInTheDocument()
    expect(screen.getByText('趋势')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '腰围 (cm)' })).toBeInTheDocument()
    expect(screen.getByText(/连续打卡/)).toBeInTheDocument()
  })
})

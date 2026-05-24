import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProgressPage from './ProgressPage'
import type { Photo, PoseTag } from '../types'

vi.mock('../db', () => ({
  getAllPhotos: vi.fn(),
  getSettings: vi.fn().mockResolvedValue({ anchorDate: '2026-05-20' }),
}))
import { getAllPhotos } from '../db'

function photo(id: string, takenAt: number, pose: PoseTag, date: string): Photo {
  return { id, blob: new Blob([id]), takenAt, pose, checkInDate: date }
}

beforeEach(() => {
  ;(getAllPhotos as Mock).mockReset()
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
})

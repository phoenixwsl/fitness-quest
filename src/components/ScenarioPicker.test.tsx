import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ScenarioPicker from './ScenarioPicker'

describe('ScenarioPicker', () => {
  it('渲染时间段与器械选项', () => {
    render(<ScenarioPicker onConfirm={vi.fn()} />)
    for (const label of ['上午', '下午', '晚上', '有器械', '无器械']) {
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument()
    }
  })

  it('选择后点开始,回调所选时间段与器械', () => {
    const onConfirm = vi.fn()
    render(<ScenarioPicker onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('radio', { name: '上午' }))
    fireEvent.click(screen.getByRole('radio', { name: '无器械' }))
    fireEvent.click(screen.getByRole('button', { name: '开始训练' }))
    expect(onConfirm).toHaveBeenCalledWith('morning', 'bodyweight')
  })

  it('支持默认预选', () => {
    const onConfirm = vi.fn()
    render(
      <ScenarioPicker onConfirm={onConfirm} defaultTimeOfDay="evening" defaultEquipment="equipped" />,
    )
    fireEvent.click(screen.getByRole('button', { name: '开始训练' }))
    expect(onConfirm).toHaveBeenCalledWith('evening', 'equipped')
  })
})

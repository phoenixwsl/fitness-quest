import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HealthNotice from './HealthNotice'

describe('HealthNotice', () => {
  it('展示免责声明、专业评估建议与红旗提示', () => {
    render(<HealthNotice onAck={vi.fn()} />)
    expect(screen.getByText('健康须知')).toBeInTheDocument()
    expect(screen.getByText(/不构成医疗建议/)).toBeInTheDocument()
    expect(screen.getByText(/风湿科或康复科/)).toBeInTheDocument()
    expect(screen.getByText(/立即停止并尽快就医/)).toBeInTheDocument()
  })

  it('点「我已知悉,继续」触发 onAck', () => {
    const onAck = vi.fn()
    render(<HealthNotice onAck={onAck} />)
    fireEvent.click(screen.getByRole('button', { name: '我已知悉,继续' }))
    expect(onAck).toHaveBeenCalledTimes(1)
  })
})

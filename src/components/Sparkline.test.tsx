import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Sparkline from './Sparkline'

describe('Sparkline', () => {
  it('无数据显示占位文案', () => {
    render(<Sparkline points={[]} />)
    expect(screen.getByText('暂无数据')).toBeInTheDocument()
  })

  it('多点画 polyline', () => {
    const { container } = render(<Sparkline points={[1, 3, 2, 5]} ariaLabel="腰围趋势" />)
    expect(container.querySelector('polyline')).toBeTruthy()
    expect(screen.getByRole('img', { name: '腰围趋势' })).toBeInTheDocument()
  })

  it('单点画一个圆点(不崩)', () => {
    const { container } = render(<Sparkline points={[5]} />)
    expect(container.querySelector('circle')).toBeTruthy()
  })
})

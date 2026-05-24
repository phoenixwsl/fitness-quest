import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const updateServiceWorker = vi.fn()
let needRefreshValue = false

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [needRefreshValue, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker,
  }),
}))

import UpdatePrompt from './UpdatePrompt'

beforeEach(() => {
  updateServiceWorker.mockReset()
  needRefreshValue = false
})

describe('UpdatePrompt', () => {
  it('无新版本时不渲染任何东西', () => {
    needRefreshValue = false
    const { container } = render(<UpdatePrompt />)
    expect(container).toBeEmptyDOMElement()
  })

  it('有新版本时显示提示,点击更新触发 updateServiceWorker', () => {
    needRefreshValue = true
    render(<UpdatePrompt />)
    expect(screen.getByText(/有新版本/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '点击更新' }))
    expect(updateServiceWorker).toHaveBeenCalledWith(true)
  })
})

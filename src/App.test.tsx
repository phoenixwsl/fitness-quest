import { describe, it, expect, beforeEach, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { render, screen, fireEvent } from '@testing-library/react'

// 全新库 + 重置模块,隔离 db 单例与数据。
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  vi.resetModules()
})

async function renderApp({ acked }: { acked: boolean }) {
  const db = await import('./db')
  if (acked) await db.setHealthAck(true)
  const { default: App } = await import('./App')
  render(<App />)
}

describe('App 健康须知门', () => {
  it('未确认时先显示健康须知,不显示今日页', async () => {
    await renderApp({ acked: false })
    expect(await screen.findByText('健康须知')).toBeInTheDocument()
    expect(screen.queryByText('选择场景')).not.toBeInTheDocument()
  })

  it('确认后进入今日页', async () => {
    await renderApp({ acked: false })
    fireEvent.click(await screen.findByRole('button', { name: '我已知悉,继续' }))
    expect(await screen.findByText('选择场景')).toBeInTheDocument()
  })
})

describe('App shell(已确认)', () => {
  it('默认显示今日页(场景选择)', async () => {
    await renderApp({ acked: true })
    expect(await screen.findByText('选择场景')).toBeInTheDocument()
  })

  it('点击进展 Tab 显示占位「即将推出」', async () => {
    await renderApp({ acked: true })
    await screen.findByText('选择场景')
    fireEvent.click(screen.getByRole('button', { name: '进展' }))
    expect(await screen.findByText(/即将推出/)).toBeInTheDocument()
  })

  it('点击复盘 Tab 显示复盘表单', async () => {
    await renderApp({ acked: true })
    await screen.findByText('选择场景')
    fireEvent.click(screen.getByRole('button', { name: '复盘' }))
    expect(await screen.findByText('今晚复盘')).toBeInTheDocument()
  })

  it('底部导航有今日 / 复盘 / 进展三个 Tab', async () => {
    await renderApp({ acked: true })
    await screen.findByText('选择场景')
    expect(screen.getByRole('button', { name: '今日' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '复盘' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '进展' })).toBeInTheDocument()
  })
})

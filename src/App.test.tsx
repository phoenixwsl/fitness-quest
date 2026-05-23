import { describe, it, expect, beforeEach } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
})

describe('App shell', () => {
  it('默认显示今日页', async () => {
    render(<App />)
    // 新库:锚点 = 今天 → dayIndex 0 → 力量 A
    expect(await screen.findByText('今日 · 力量 A')).toBeInTheDocument()
  })

  it('点击进展 Tab 显示占位「即将推出」', async () => {
    render(<App />)
    await screen.findByText('今日 · 力量 A')
    fireEvent.click(screen.getByRole('button', { name: '进展' }))
    expect(await screen.findByText(/即将推出/)).toBeInTheDocument()
  })

  it('点击复盘 Tab 显示复盘表单', async () => {
    render(<App />)
    await screen.findByText('今日 · 力量 A')
    fireEvent.click(screen.getByRole('button', { name: '复盘' }))
    expect(await screen.findByText('今晚复盘')).toBeInTheDocument()
  })

  it('底部导航有今日 / 复盘 / 进展三个 Tab', async () => {
    render(<App />)
    await screen.findByText('今日 · 力量 A')
    expect(screen.getByRole('button', { name: '今日' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '复盘' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '进展' })).toBeInTheDocument()
  })
})

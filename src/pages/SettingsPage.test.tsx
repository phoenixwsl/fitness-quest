import { describe, it, expect, beforeEach, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { render, screen, fireEvent } from '@testing-library/react'

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  vi.resetModules()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

async function renderSettings() {
  const { default: SettingsPage } = await import('./SettingsPage')
  render(<SettingsPage onClose={() => {}} />)
  await screen.findByText('数据备份')
}

async function db() {
  return import('../db')
}

describe('SettingsPage 数据备份', () => {
  it('渲染备份区与导出 / 导入入口', async () => {
    await renderSettings()
    expect(screen.getByRole('button', { name: '导出备份' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '导入备份' })).toBeInTheDocument()
  })

  it('显示应用版本号', async () => {
    await renderSettings()
    expect(screen.getByText(/版本 v\d+\.\d+\.\d+/)).toBeInTheDocument()
  })

  it('点击导出后记录 lastBackupAt', async () => {
    await renderSettings()
    fireEvent.click(screen.getByRole('button', { name: '导出备份' }))
    await screen.findByText(/已导出/)
    const s = await (await db()).getSettings()
    expect(typeof s.lastBackupAt).toBe('number')
  })

  it('导入备份文件后覆盖恢复数据', async () => {
    const d = await db()
    // 构造一个含 1 条 checkIn 的备份文件
    await d.putCheckIn({
      date: '2026-05-24',
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
    const { serializeBackup } = await import('../lib/backup')
    const backup = await serializeBackup(await d.exportAllStores())
    // 清掉当前数据,验证导入能恢复
    await d.importAllStores({
      settings: undefined, checkIns: [], photos: [], metrics: [],
      scenarios: [], dailyPlans: [], exerciseCounts: [],
    })
    expect(await d.getCheckIn('2026-05-24')).toBeUndefined()

    await renderSettings()
    const input = screen.getByLabelText('导入备份文件')
    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' })
    fireEvent.change(input, { target: { files: [file] } })
    await screen.findByText(/导入成功/)
    expect(await d.getCheckIn('2026-05-24')).toBeDefined()
  })
})

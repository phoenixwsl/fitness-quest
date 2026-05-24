import { useEffect, useRef, useState } from 'react'
import { exportAllStores, getSettings, importAllStores, updateSettings } from '../db'
import { deserializeBackup, serializeBackup, type BackupFile } from '../lib/backup'
import { DEFAULT_REMINDER_TIME } from '../lib/reminder'

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => resolve(reader.result as string)
    reader.readAsText(file)
  })
}

export default function SettingsPage({ onClose }: { onClose: () => void }) {
  const [lastBackupAt, setLastBackupAt] = useState<number | undefined>(undefined)
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME)
  const [status, setStatus] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getSettings().then((s) => {
      setLastBackupAt(s.lastBackupAt)
      setReminderTime(s.reminderTime ?? DEFAULT_REMINDER_TIME)
    })
  }, [])

  async function handleReminderChange(value: string) {
    setReminderTime(value)
    await updateSettings({ reminderTime: value })
  }

  async function handleExport() {
    const file = await serializeBackup(await exportAllStores())
    const blob = new Blob([JSON.stringify(file)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fitness-quest-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    const now = Date.now()
    await updateSettings({ lastBackupAt: now })
    setLastBackupAt(now)
    setStatus('已导出备份,请妥善保存这个文件。')
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!window.confirm('导入会用备份覆盖当前全部数据,无法撤销。确定吗?')) {
      e.target.value = ''
      return
    }
    try {
      const file = JSON.parse(await readFileAsText(f)) as BackupFile
      await importAllStores(deserializeBackup(file))
      setStatus('导入成功,已恢复。即将刷新…')
      try {
        location.reload()
      } catch {
        /* 测试环境无 reload,忽略 */
      }
    } catch {
      setStatus('导入失败:文件无效或损坏。')
    } finally {
      e.target.value = ''
    }
  }

  const lastBackupText = lastBackupAt
    ? `上次备份:${new Date(lastBackupAt).toLocaleString('zh-CN')}`
    : '还没有备份过。'

  return (
    <div className="flex min-h-dvh flex-col gap-4 bg-slate-50 p-4 pb-24">
      <header className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-slate-900">设置</h1>
        <button type="button" onClick={onClose} className="text-sm text-teal-700">
          完成
        </button>
      </header>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-slate-800">数据备份</h2>
        <p className="mb-3 text-xs text-slate-500">
          数据只存在这台设备上。<strong className="text-slate-700">建议定期导出备份</strong>
          ,换手机或清缓存前尤其要先导出。
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            导出备份
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700"
          >
            导入备份
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            aria-label="导入备份文件"
            onChange={handleFile}
            className="hidden"
          />
        </div>
        <p className="mt-3 text-xs text-slate-400">{lastBackupText}</p>
        {status && <p className="mt-1 text-xs text-teal-700">{status}</p>}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-slate-800">打卡提醒</h2>
        <p className="mb-3 text-xs text-slate-500">
          App 不自建推送。请把下面的时间一次性加到手机自带「提醒事项 / 闹钟」;打开 App 时若已过复盘时间还没打卡,首页也会提示你。
        </p>
        <div className="flex items-center gap-3">
          <label htmlFor="reminder-time" className="text-sm text-slate-700">
            复盘提醒时间
          </label>
          <input
            id="reminder-time"
            type="time"
            value={reminderTime}
            onChange={(e) => handleReminderChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
          />
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <p className="mb-1 font-medium text-slate-700">建议提醒时间表</p>
          <p>· 训练提醒 20:00 —— 提示开始当晚训练</p>
          <p>· 复盘打卡提醒 {reminderTime} —— 训练 + 体态放松之后</p>
          <p className="mt-1 text-slate-400">喝水 / 三餐可绑定到既有生活习惯,不必单设。</p>
        </div>
      </section>

      <p className="mt-auto pt-4 text-center text-xs text-slate-400">版本 v{__APP_VERSION__}</p>
    </div>
  )
}

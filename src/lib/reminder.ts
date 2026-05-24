// 打卡提醒(App 内补提醒)。不自建推送 —— 系统级提醒交给手机「提醒事项」。
export const DEFAULT_REMINDER_TIME = '21:30'

// 是否该在 App 内提醒补打卡:今天还没打卡 且 已过设定的复盘提醒时间。
export function isCheckinOverdue(
  reminderTime: string,
  now: Date,
  checkedInToday: boolean,
): boolean {
  if (checkedInToday) return false
  const [h, m] = reminderTime.split(':').map(Number)
  const nowMins = now.getHours() * 60 + now.getMinutes()
  return nowMins >= h * 60 + m
}

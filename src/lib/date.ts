const MS_PER_DAY = 24 * 60 * 60 * 1000

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

// 本地时区的 YYYY-MM-DD。
export function todayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// today 距 anchor 的整天数(可为负)。
export function daysSinceAnchor(anchorKey: string, todayKeyStr: string): number {
  const diff = parseKey(todayKeyStr).getTime() - parseKey(anchorKey).getTime()
  return Math.round(diff / MS_PER_DAY)
}

// 映射到静态一周计划的索引 0..6,对负数取正模。
export function planDayIndex(anchorKey: string, todayKeyStr: string): number {
  return ((daysSinceAnchor(anchorKey, todayKeyStr) % 7) + 7) % 7
}

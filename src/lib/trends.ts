import type { CheckIn, Metric, Stiffness } from '../types'
import { addDays } from './date'

// 进展趋势:全部纯函数,便于单元测试。数据少时序列短是正常的。

export interface Point {
  date: string
  value: number
}

const byDate = (a: { date: string }, b: { date: string }) => (a.date < b.date ? -1 : 1)

const STIFFNESS_SCORE: Record<Stiffness, number> = { none: 0, lt30: 1, '30to60': 2, gt60: 3 }

export function stiffnessScore(s: Stiffness): number {
  return STIFFNESS_SCORE[s]
}

export function waistSeries(metrics: Metric[]): Point[] {
  return metrics
    .filter((m) => m.waist != null)
    .map((m) => ({ date: m.date, value: m.waist as number }))
    .sort(byDate)
}

export function weightSeries(metrics: Metric[]): Point[] {
  return metrics
    .filter((m) => m.weight != null)
    .map((m) => ({ date: m.date, value: m.weight as number }))
    .sort(byDate)
}

export function stiffnessSeries(checkIns: CheckIn[]): Point[] {
  return [...checkIns].sort(byDate).map((c) => ({ date: c.date, value: stiffnessScore(c.stiffness) }))
}

// 训练完成率:done=1 / partial=0.5 / skipped=0;休息日不计入分母。无可计入日返回 null。
export function completionRate(checkIns: CheckIn[]): number | null {
  const counted = checkIns.filter((c) => c.trainingStatus !== 'restday')
  if (counted.length === 0) return null
  const sum = counted.reduce(
    (a, c) => a + (c.trainingStatus === 'done' ? 1 : c.trainingStatus === 'partial' ? 0.5 : 0),
    0,
  )
  return sum / counted.length
}

// 连续打卡天数:从 today 往前数连续有 checkIn 的天数;today 当天还没打卡则从昨天起算(不惩罚)。
export function currentStreak(checkIns: CheckIn[], today: string): number {
  const dates = new Set(checkIns.map((c) => c.date))
  let cursor = today
  if (!dates.has(cursor)) cursor = addDays(cursor, -1)
  let streak = 0
  while (dates.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

export interface WeeklySummary {
  checkInDays: number
  trainingDays: number
  text: string
}

// 近 7 天(含今天)小结。文案温和、不惩罚漏打卡。
export function weeklySummary(checkIns: CheckIn[], today: string): WeeklySummary {
  const since = addDays(today, -6)
  const week = checkIns.filter((c) => c.date >= since && c.date <= today)
  const checkInDays = new Set(week.map((c) => c.date)).size
  const trainingDays = week.filter(
    (c) => c.trainingStatus === 'done' || c.trainingStatus === 'partial',
  ).length
  const text =
    checkInDays === 0
      ? '这周还没打卡。今晚来记一笔,从「最低版本」开始也算数。'
      : `这周打卡 ${checkInDays} 天、训练 ${trainingDays} 次。坚持比强度更重要,保持你的节奏就好。`
  return { checkInDays, trainingDays, text }
}

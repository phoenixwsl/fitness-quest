import type { CheckIn, DailyPlan, Energy, PlanType, Stiffness } from '../types'
import { addDays } from './date'

// 动态计划引擎(设计文档 §5)。纯函数、透明、可单元测试。
// 引擎只决定「训练类型」;场景(时间段 + 器械)由用户另选,二者组合成最终计划。

export type SymptomBand = 'green' | 'yellow' | 'red'

export interface EngineInput {
  band: SymptomBand
  redFlag: boolean
  consecutiveTrainingDays: number
  weeklyStrengthCount: number
  lastStrengthVariant: 'A' | 'B' | null
}

export interface EngineOutput {
  type: PlanType
  reason: string
}

// §5.2 症状分档(满足其一即归入更重档)。
export function classifyBand(c: { stiffness: Stiffness; pain: number; energy: Energy }): SymptomBand {
  if (c.stiffness === 'gt60' || c.pain >= 6) return 'red'
  if (c.stiffness === '30to60' || c.pain >= 3 || c.energy === 'low') return 'yellow'
  return 'green'
}

const TRAINING_TYPES: PlanType[] = ['strengthA', 'strengthB', 'mobility']

function isCompleted(status: CheckIn['trainingStatus']): boolean {
  return status === 'done' || status === 'partial'
}

// §5.3 决策规则,按序判断,命中即停。
export function decideNextType(input: EngineInput): EngineOutput {
  if (input.redFlag) {
    return { type: 'rest', reason: '命中红旗信号 → 休息,并尽快就医 / 联系专业评估' }
  }
  if (input.band === 'red') {
    return { type: 'recovery', reason: '昨日为红档(发作期)→ 温和恢复日,无负荷' }
  }
  if (input.band === 'yellow') {
    return { type: 'mobility', reason: '昨日为黄档(波动期)→ 体态 / 活动度日' }
  }
  if (input.consecutiveTrainingDays >= 2) {
    return { type: 'recovery', reason: `已连续训练 ${input.consecutiveTrainingDays} 天 → 今日主动恢复` }
  }
  if (input.weeklyStrengthCount >= 3) {
    return { type: 'mobility', reason: '本周力量已达 3 次 → 今日体态 / 活动度' }
  }
  const variant = input.lastStrengthVariant === 'A' ? 'B' : 'A'
  return {
    type: variant === 'A' ? 'strengthA' : 'strengthB',
    reason: `状态稳定 → 力量 ${variant}(A/B 轮换)`,
  }
}

// 从历史(dailyPlans + checkIns)装配引擎输入。asOfDate = 当晚复盘的日期。
export function buildEngineInput(
  checkIns: CheckIn[],
  dailyPlans: DailyPlan[],
  asOfDate: string,
): EngineInput {
  const checkByDate = new Map(checkIns.map((c) => [c.date, c]))
  const planByDate = new Map(dailyPlans.map((p) => [p.date, p]))

  const todayCheck = checkByDate.get(asOfDate)
  const band = todayCheck ? classifyBand(todayCheck) : 'green'
  const redFlag = todayCheck?.redFlag ?? false

  // 连续训练天数:从 asOfDate 往前数,训练日(力量/活动度)且当天完成才计,遇其他中断。
  let consecutiveTrainingDays = 0
  for (let d = asOfDate; ; d = addDays(d, -1)) {
    const p = planByDate.get(d)
    const c = checkByDate.get(d)
    if (p && TRAINING_TYPES.includes(p.type) && c && isCompleted(c.trainingStatus)) {
      consecutiveTrainingDays++
    } else {
      break
    }
  }

  // 本周力量次数:窗口 [asOfDate-6, asOfDate] 内完成的力量日。
  const windowStart = addDays(asOfDate, -6)
  let weeklyStrengthCount = 0
  for (const p of dailyPlans) {
    if (
      (p.type === 'strengthA' || p.type === 'strengthB') &&
      p.date >= windowStart &&
      p.date <= asOfDate
    ) {
      const c = checkByDate.get(p.date)
      if (c && isCompleted(c.trainingStatus)) weeklyStrengthCount++
    }
  }

  // 最近一次力量日的 A/B(date <= asOfDate)。
  let lastStrengthVariant: 'A' | 'B' | null = null
  let lastDate = ''
  for (const p of dailyPlans) {
    if (
      (p.type === 'strengthA' || p.type === 'strengthB') &&
      p.date <= asOfDate &&
      p.date > lastDate
    ) {
      lastDate = p.date
      lastStrengthVariant = p.type === 'strengthA' ? 'A' : 'B'
    }
  }

  return { band, redFlag, consecutiveTrainingDays, weeklyStrengthCount, lastStrengthVariant }
}

// v0 领域类型。计划即数据:训练计划是结构化 JSON,App 只负责渲染。

export type PlanType = 'strengthA' | 'strengthB' | 'mobility' | 'recovery' | 'rest'

export interface ExerciseItem {
  name: string
  prescription: string
  note?: string
}

export interface DayPlan {
  dayIndex: number // 0..6
  type: PlanType
  label: string // 如 "力量 A"
  morningTitle: string // 如 "早上 · 力量 A · 约 35 分钟"
  warmup: string[] // 可空数组
  main: ExerciseItem[] // 早上主训练动作(休息日为空)
  eveningMobility: string[] // 晚间体态放松——每天非空(永不归零)
  minimumVersion: string // 最低版本兜底文案
  diet: string
  water: string
}

export type TrainingStatus = 'done' | 'partial' | 'skipped' | 'restday'
export type DietRating = 'good' | 'ok' | 'indulged'
export type WaterStatus = 'enough' | 'notEnough'
export type Stiffness = 'none' | 'lt30' | '30to60' | 'gt60'
export type Energy = 'low' | 'mid' | 'high'
export type ActivityTag =
  | 'eveningMobility'
  | 'walk'
  | 'water'
  | 'dietControl'
  | 'stretch'
  | 'earlySleep'

export interface CheckIn {
  date: string // 'YYYY-MM-DD'(主键)
  trainingStatus: TrainingStatus
  activityTags: ActivityTag[]
  dietRating: DietRating
  water: WaterStatus
  stiffness: Stiffness
  pain: number // 0..10
  energy: Energy
  mood: number // 1..5
  redFlag: boolean // 红旗自检命中
  note?: string
  photoIds: string[] // v0: 0..1
  isBackfill: boolean // v0 恒 false
  createdAt: number // Date.now()
}

export type PoseTag = 'front' | 'side' | 'back'

export interface Photo {
  id: string
  blob: Blob
  takenAt: number
  pose: PoseTag
  checkInDate: string
}

export interface Metric {
  date: string // 'YYYY-MM-DD'(主键)
  weight?: number
  waist?: number
}

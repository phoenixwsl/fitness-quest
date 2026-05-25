// v0 领域类型。计划即数据:训练计划是结构化 JSON,App 只负责渲染。

export type PlanType = 'strengthA' | 'strengthB' | 'mobility' | 'recovery' | 'rest'

// 场景:用户每次训练前选择。时间段只影响热身与提示;器械决定动作清单。
export type TimeOfDay = 'morning' | 'afternoon' | 'evening'
export type Equipment = 'equipped' | 'bodyweight'

export interface ExerciseItem {
  exerciseId: string // 关联动作库
  name: string
  prescription: string
  note?: string
}

// 动作内容英文镜像(中英并列展示用;内容来自素材包,不改写)。
export interface ExerciseEn {
  name: string
  target: string
  steps: string[]
  cues: string[]
  mistakes: string[]
  asSafety: string
  alternative: string
}

// wger 补充图片引用(仅安全筛选通过的动作才有;CC-BY-SA 3.0 须署名)。
export interface WgerImageRef {
  src: string // 已打包的本地资源 URL(运行时不联网)
  author?: string // CC-BY-SA 署名作者(若 API 提供)
  license: string // 固定 'CC-BY-SA 3.0'
}

// 动作库条目:详情 + AS 安全标注 + 简笔示意图(SVG)+ 中英双语。
export interface Exercise {
  id: string
  name: string
  target: string // 目标部位
  steps: string[] // 怎么做(分步)
  cues: string[] // 要领
  mistakes: string[] // 常见错误
  asSafety: string // AS 安全提示
  alternative: string // 替代动作
  en: ExerciseEn // 英文镜像
  imageUrl?: string
}

// 按训练「类型」组织的计划(时间中性)。最终计划 = 类型 × 场景(时间段 + 器械)。
export interface TrainingTypePlan {
  type: PlanType
  label: string // 如 "力量 A"
  sessionTitle: string // 时间中性,如 "主训练 · 约 35 分钟";时间段前缀由今日页拼
  // 主训练动作:力量日含有器械 / 徒手两套;非力量日两键指向同一清单;休息日两键皆空。
  main: { equipped: ExerciseItem[]; bodyweight: ExerciseItem[] }
  safetyNote: string // 训练日安全提示;非训练日可为空
  eveningMobility: string[] // 晚间体态放松——每天非空(永不归零)
  minimumVersion: string // 最低版本兜底文案
  diet: string
  water: string
}

export interface Scenario {
  date: string // 'YYYY-MM-DD'(主键)
  timeOfDay: TimeOfDay
  equipment: Equipment
}

// 动态引擎为某一天决定的训练类型 + 生成理由(透明可解释)。
export interface DailyPlan {
  date: string // 'YYYY-MM-DD'(主键)
  type: PlanType
  reason: string
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

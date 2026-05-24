import type { ExerciseItem, PlanType, TimeOfDay, TrainingTypePlan } from '../types'

// 静态计划数据(v1)。全部动作出自设计文档 §2.5 安全动作池、§6、附录B。
// 保守档:无脊柱大重量纵向负荷、无高冲击跑跳、无壶铃摆动、无传统屈曲卷腹;单侧动作两侧对等。
// 「计划即数据」:调方案改这份 JSON,不改代码。
// 时间中性:sessionTitle 不含时间段;时间段前缀与额外热身/提示见 TIME_OF_DAY,由今日页拼。
// 每个动作的 exerciseId 关联动作库(详情 + AS 安全标注),见 exerciseLibrary.ts。

const BASE_WARMUP = ['温和猫牛 1 分钟', '髋绕环 1 分钟', '扩胸呼吸 1 分钟']

const EVENING_MOBILITY = [
  '髋屈肌拉伸 30 秒 / 侧',
  '胸部开门拉伸 30 秒 / 侧',
  '收下巴(深层颈屈肌)×8',
  '靠墙天使 ×8',
  '温和后伸 ×6',
]

const MINIMUM = '状态差时只做这个:晚间体态放松约 10 分钟 + 完成复盘打卡。'
const DIET = '蛋白质优先(约 130–150g)· 餐盘法(½ 蔬菜 ¼ 蛋白 ¼ 主食)· 抗炎倾向,减少高糖与高度加工。'
const WATER = '喝水 2–2.5L,绑定起床 / 每餐 / 训练各一杯。'
const STRENGTH_SAFETY = '组间休息 60–90 秒。技术优先,中小重量,任何动作出现锐痛即停。'

const STRENGTH_A: TrainingTypePlan = {
  type: 'strengthA',
  label: '力量 A',
  sessionTitle: '主训练 · 约 35 分钟',
  main: {
    equipped: [
      { exerciseId: 'goblet-squat', name: '高脚杯深蹲', prescription: '3 × 10', note: '中小重量,躯干中立,下蹲不耸肩' },
      { exerciseId: 'db-row', name: '哑铃单臂支撑划船', prescription: '3 × 10 / 侧', note: '两侧组次对等' },
      { exerciseId: 'pushup', name: '上斜或标准俯卧撑', prescription: '3 组', note: '力量不足先做上斜版' },
      { exerciseId: 'glute-bridge', name: '臀桥', prescription: '3 × 12', note: '顶峰收紧臀部,不靠腰发力' },
      { exerciseId: 'dead-bug', name: '死虫', prescription: '3 × 8 / 侧', note: '抗伸展核心,腰背贴地' },
    ],
    bodyweight: [
      { exerciseId: 'bw-squat', name: '自重深蹲', prescription: '3 × 12', note: '椅子辅助→自由,躯干中立' },
      { exerciseId: 'ytw', name: '俯卧 YTW', prescription: '3 × 8', note: '替代「拉」:俯卧、拇指朝上,练上背后链' },
      { exerciseId: 'pushup', name: '上斜或跪姿到标准俯卧撑', prescription: '3 组', note: '力量不足先做上斜 / 跪姿版' },
      { exerciseId: 'glute-bridge', name: '臀桥', prescription: '3 × 12', note: '顶峰收紧臀部,不靠腰发力' },
      { exerciseId: 'dead-bug', name: '死虫', prescription: '3 × 8 / 侧', note: '抗伸展核心,腰背贴地' },
    ],
  },
  safetyNote: STRENGTH_SAFETY,
  eveningMobility: EVENING_MOBILITY,
  minimumVersion: MINIMUM,
  diet: DIET,
  water: WATER,
}

const STRENGTH_B: TrainingTypePlan = {
  type: 'strengthB',
  label: '力量 B',
  sessionTitle: '主训练 · 约 35 分钟',
  main: {
    equipped: [
      { exerciseId: 'split-squat', name: '分腿蹲', prescription: '3 × 8 / 侧', note: '自重或中小重量,两侧对等' },
      { exerciseId: 'floor-press', name: '哑铃地面卧推', prescription: '3 × 10', note: '地面限制肩后伸,更护肩' },
      { exerciseId: 'db-row', name: '哑铃单臂支撑划船', prescription: '3 × 10 / 侧', note: '两侧组次对等' },
      { exerciseId: 'bird-dog', name: '鸟狗', prescription: '3 × 8 / 侧', note: '抗旋转核心,缓慢可控' },
      { exerciseId: 'side-plank', name: '侧桥', prescription: '3 × 20–30 秒 / 侧', note: '两侧对等,顾及侧弯对称' },
    ],
    bodyweight: [
      { exerciseId: 'split-squat', name: '分腿蹲(自重)', prescription: '3 × 8 / 侧', note: '两侧对等,膝不内扣' },
      { exerciseId: 'pushup', name: '上斜或跪姿到标准俯卧撑', prescription: '3 组', note: '替代地面卧推' },
      { exerciseId: 'superman', name: '温和 superman', prescription: '3 × 8', note: '替代「拉」:后链,不过度后伸、不顶痛' },
      { exerciseId: 'bird-dog', name: '鸟狗', prescription: '3 × 8 / 侧', note: '抗旋转核心,缓慢可控' },
      { exerciseId: 'side-plank', name: '侧桥', prescription: '3 × 20–30 秒 / 侧', note: '两侧对等,顾及侧弯对称' },
    ],
  },
  safetyNote: STRENGTH_SAFETY,
  eveningMobility: EVENING_MOBILITY,
  minimumVersion: MINIMUM,
  diet: DIET,
  water: WATER,
}

const MOBILITY_MAIN: ExerciseItem[] = [
  { exerciseId: 'cat-cow', name: '温和猫牛', prescription: '×8–10' },
  { exerciseId: 't-rotation', name: '胸椎旋转', prescription: '×8 / 侧' },
  { exerciseId: 'hip-flexor-stretch', name: '髋屈肌拉伸', prescription: '30 秒 / 侧' },
  { exerciseId: 'hamstring-stretch', name: '腘绳肌拉伸', prescription: '30 秒 / 侧' },
  { exerciseId: 'chest-opener', name: '胸部开门拉伸', prescription: '30 秒 / 侧' },
  { exerciseId: 'pelvic-clock', name: '骨盆时钟', prescription: '×8' },
  { exerciseId: 'gentle-extension', name: '温和后伸(眼镜蛇 / 婴儿式交替)', prescription: '×6' },
  { exerciseId: 'breathing', name: '扩胸深呼吸', prescription: '×8' },
  { exerciseId: 'walk', name: '快走', prescription: '20–30 分钟', note: '低冲击有氧,配速以能正常说话为准' },
]

const MOBILITY: TrainingTypePlan = {
  type: 'mobility',
  label: '活动度 / 体态 + 散步',
  sessionTitle: '活动度 / 体态 · 约 20–25 分钟 + 快走 20–30 分钟',
  main: { equipped: MOBILITY_MAIN, bodyweight: MOBILITY_MAIN },
  safetyNote: '全程温和,以活动度与伸展为主,不顶着锐痛拉伸。',
  eveningMobility: EVENING_MOBILITY,
  minimumVersion: MINIMUM,
  diet: DIET,
  water: WATER,
}

const RECOVERY_MAIN: ExerciseItem[] = [
  { exerciseId: 'breathing', name: '扩胸深呼吸', prescription: '×8' },
  { exerciseId: 'cat-cow', name: '温和猫牛', prescription: '×8' },
  { exerciseId: 'hip-flexor-stretch', name: '髋屈肌拉伸', prescription: '30 秒 / 侧' },
  { exerciseId: 'gentle-extension', name: '温和后伸', prescription: '×6' },
  { exerciseId: 'walk', name: '短距散步', prescription: '15–20 分钟' },
]

const RECOVERY: TrainingTypePlan = {
  type: 'recovery',
  label: '恢复日',
  sessionTitle: '恢复 · 温和活动度 + 短距散步',
  main: { equipped: RECOVERY_MAIN, bodyweight: RECOVERY_MAIN },
  safetyNote: '恢复日无任何负荷,只做温和活动度与散步。',
  eveningMobility: EVENING_MOBILITY,
  minimumVersion: MINIMUM,
  diet: DIET,
  water: WATER,
}

const REST: TrainingTypePlan = {
  type: 'rest',
  label: '休息',
  sessionTitle: '休息',
  main: { equipped: [], bodyweight: [] },
  safetyNote: '',
  eveningMobility: EVENING_MOBILITY,
  minimumVersion: MINIMUM,
  diet: DIET,
  water: WATER,
}

const PLANS: Record<PlanType, TrainingTypePlan> = {
  strengthA: STRENGTH_A,
  strengthB: STRENGTH_B,
  mobility: MOBILITY,
  recovery: RECOVERY,
  rest: REST,
}

export function getPlanForType(type: PlanType): TrainingTypePlan {
  return PLANS[type]
}

// 时间段:只影响热身与提示,不改动作清单。
export const TIME_OF_DAY: Record<
  TimeOfDay,
  { label: string; warmupExtra: string[]; tip: string }
> = {
  morning: {
    label: '上午',
    warmupExtra: ['晨僵未消时先做 2–3 分钟温和活动度再正式开始', '热身动作放慢、多做一组'],
    tip: '上午常有晨僵,起步更慢、热身更充分;顶着锐痛不练。',
  },
  afternoon: {
    label: '下午',
    warmupExtra: [],
    tip: '身体已活动开,按常规热身即可。',
  },
  evening: {
    label: '晚上',
    warmupExtra: ['临近睡前则强度再降一档'],
    tip: '晚间偏温和,留足睡前缓冲,大强度往前压。',
  },
}

export const BASE_WARMUP_LIST = BASE_WARMUP

// §6.4 顺序:力量A → 活动度 → 力量B → 恢复 → 力量A → 活动度 → 休息。
// v1-PR1 暂仍用锚点轮换决定「类型」;PR4 由动态引擎替换。
export const TYPE_CYCLE: PlanType[] = [
  'strengthA',
  'mobility',
  'strengthB',
  'recovery',
  'strengthA',
  'mobility',
  'rest',
]

export function getTypeForDayIndex(i: number): PlanType {
  return TYPE_CYCLE[((i % 7) + 7) % 7]
}

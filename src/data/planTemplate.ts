import type { DayPlan } from '../types'

// 静态一周计划(v0)。全部动作出自设计文档 §2.5 安全动作池、§6、附录B。
// 保守档:无脊柱大重量纵向负荷、无高冲击跑跳、无壶铃摆动、无传统屈曲卷腹;单侧动作两侧对等。
// 「计划即数据」:调方案改这份 JSON,不改代码。

const WARMUP = ['温和猫牛 1 分钟', '髋绕环 1 分钟', '扩胸呼吸 1 分钟']

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

const STRENGTH_A: DayPlan = {
  dayIndex: 0,
  type: 'strengthA',
  label: '力量 A',
  morningTitle: '早上 · 力量 A · 约 35 分钟',
  warmup: WARMUP,
  main: [
    { name: '高脚杯深蹲', prescription: '3 × 10', note: '中小重量,躯干中立,下蹲不耸肩' },
    { name: '哑铃单臂支撑划船', prescription: '3 × 10 / 侧', note: '两侧组次对等' },
    { name: '上斜或标准俯卧撑', prescription: '3 组', note: '力量不足先做上斜版' },
    { name: '臀桥', prescription: '3 × 12', note: '顶峰收紧臀部,不靠腰发力' },
    { name: '死虫', prescription: '3 × 8 / 侧', note: '抗伸展核心,腰背贴地' },
  ],
  safetyNote: STRENGTH_SAFETY,
  eveningMobility: EVENING_MOBILITY,
  minimumVersion: MINIMUM,
  diet: DIET,
  water: WATER,
}

const MOBILITY: DayPlan = {
  dayIndex: 1,
  type: 'mobility',
  label: '活动度 / 体态 + 散步',
  morningTitle: '早上 · 活动度 / 体态 · 约 20–25 分钟 + 快走 20–30 分钟',
  warmup: WARMUP,
  main: [
    { name: '温和猫牛', prescription: '×8–10' },
    { name: '胸椎旋转', prescription: '×8 / 侧' },
    { name: '髋屈肌拉伸', prescription: '30 秒 / 侧' },
    { name: '腘绳肌拉伸', prescription: '30 秒 / 侧' },
    { name: '胸部开门拉伸', prescription: '30 秒 / 侧' },
    { name: '骨盆时钟', prescription: '×8' },
    { name: '温和后伸(眼镜蛇 / 婴儿式交替)', prescription: '×6' },
    { name: '扩胸深呼吸', prescription: '×8' },
    { name: '快走', prescription: '20–30 分钟', note: '低冲击有氧,配速以能正常说话为准' },
  ],
  safetyNote: '全程温和,以活动度与伸展为主,不顶着锐痛拉伸。',
  eveningMobility: EVENING_MOBILITY,
  minimumVersion: MINIMUM,
  diet: DIET,
  water: WATER,
}

const STRENGTH_B: DayPlan = {
  dayIndex: 2,
  type: 'strengthB',
  label: '力量 B',
  morningTitle: '早上 · 力量 B · 约 35 分钟',
  warmup: WARMUP,
  main: [
    { name: '分腿蹲', prescription: '3 × 8 / 侧', note: '自重或中小重量,两侧对等' },
    { name: '哑铃地面卧推', prescription: '3 × 10', note: '地面限制肩后伸,更护肩' },
    { name: '哑铃单臂支撑划船', prescription: '3 × 10 / 侧', note: '两侧组次对等' },
    { name: '鸟狗', prescription: '3 × 8 / 侧', note: '抗旋转核心,缓慢可控' },
    { name: '侧桥', prescription: '3 × 20–30 秒 / 侧', note: '两侧对等,顾及侧弯对称' },
  ],
  safetyNote: STRENGTH_SAFETY,
  eveningMobility: EVENING_MOBILITY,
  minimumVersion: MINIMUM,
  diet: DIET,
  water: WATER,
}

const RECOVERY: DayPlan = {
  dayIndex: 3,
  type: 'recovery',
  label: '恢复日',
  morningTitle: '早上 · 恢复日 · 温和活动度 + 短距散步',
  warmup: [],
  main: [
    { name: '扩胸深呼吸', prescription: '×8' },
    { name: '温和猫牛', prescription: '×8' },
    { name: '髋屈肌拉伸', prescription: '30 秒 / 侧' },
    { name: '温和后伸', prescription: '×6' },
    { name: '短距散步', prescription: '15–20 分钟' },
  ],
  safetyNote: '恢复日无任何负荷,只做温和活动度与散步。',
  eveningMobility: EVENING_MOBILITY,
  minimumVersion: MINIMUM,
  diet: DIET,
  water: WATER,
}

const REST: DayPlan = {
  dayIndex: 6,
  type: 'rest',
  label: '休息',
  morningTitle: '早上 · 休息',
  warmup: [],
  main: [],
  safetyNote: '',
  eveningMobility: EVENING_MOBILITY,
  minimumVersion: MINIMUM,
  diet: DIET,
  water: WATER,
}

// §6.4 顺序:力量A → 活动度 → 力量B → 恢复 → 力量A → 活动度 → 休息。
export const WEEK_PLAN: DayPlan[] = [
  STRENGTH_A,
  MOBILITY,
  STRENGTH_B,
  RECOVERY,
  { ...STRENGTH_A, dayIndex: 4 },
  { ...MOBILITY, dayIndex: 5 },
  REST,
]

export function getPlanForDayIndex(i: number): DayPlan {
  return WEEK_PLAN[((i % 7) + 7) % 7]
}

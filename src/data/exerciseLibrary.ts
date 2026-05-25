import type { Exercise, ExerciseEn } from '../types'
import enContent from './exerciseContent.en.json'

// 动作库。中文文字详解,保守、符合设计文档 §2 安全约束;英文镜像由素材包并入(见文件末)。
// 「拉」的徒手替代用俯卧后链(YTW / superman);所有内容避开脊柱大负荷、屈曲卷腹、高冲击、摆动。

const BASE: Omit<Exercise, 'en'>[] = [
  {
    id: 'goblet-squat',
    name: '高脚杯深蹲',
    target: '下肢(股四头 / 臀)+ 核心',
    steps: [
      '双手抱哑铃或壶铃于胸前,双脚略宽于肩、脚尖微外八',
      '吸气,屈髋屈膝向后下方坐,膝盖对齐脚尖',
      '下到大腿接近平行或自己舒适的深度,躯干保持中立',
      '呼气,全脚掌发力站起',
    ],
    cues: ['重心落在全脚掌,膝盖不内扣', '躯干挺直,不弓腰塌背'],
    mistakes: ['下蹲时圆背 / 塌腰', '膝盖向内夹'],
    asSafety: '中小重量、躯干中立,避免脊柱纵向大负荷;任何动作出现锐痛即停。',
    alternative: '去掉配重做自重深蹲,或坐到椅子再起身(箱式)降难度。',
  },
  {
    id: 'bw-squat',
    name: '自重深蹲',
    target: '下肢(股四头 / 臀)+ 核心',
    steps: [
      '双脚略宽于肩,双手向前平举帮助平衡',
      '屈髋屈膝向后下方坐,膝盖对齐脚尖',
      '下到舒适深度,躯干保持中立',
      '全脚掌发力站起,顶峰收紧臀部',
    ],
    cues: ['全脚掌受力,膝不内扣', '起身收臀,不靠腰'],
    mistakes: ['膝盖内扣', '圆腰 / 塌腰'],
    asSafety: '自重无负荷、躯干中立;锐痛即停。',
    alternative: '坐到椅子再起身(箱式深蹲)降难度。',
  },
  {
    id: 'db-row',
    name: '哑铃单臂支撑划船',
    target: '上背 / 背阔 / 后链',
    steps: [
      '一手一膝撑在长凳或稳固平面上,背部保持平直',
      '另一手持哑铃自然下垂',
      '肩胛先后收,肘贴身体向后上方拉哑铃到体侧',
      '控制着放回,不耸肩',
    ],
    cues: ['背平、躯干不旋转', '用背带动,而非耸肩借力'],
    mistakes: ['躯干扭转借力', '圆背'],
    asSafety: '支撑姿势保护下背,两侧组次对等;锐痛即停。',
    alternative: '无器械时用俯卧 YTW 替代这个「拉」动作。',
  },
  {
    id: 'ytw',
    name: '俯卧 YTW',
    target: '上背 / 后链 / 肩袖(姿势改善)',
    steps: [
      '俯卧,额头轻贴垫子,颈部放松',
      '依次摆出 Y、T、W 三个手臂姿势,拇指朝上',
      '每个姿势肩胛后收,手臂微抬离地',
      '缓慢可控,不甩',
    ],
    cues: ['发力在上背,不耸肩', '颈部放松、目视下方'],
    mistakes: ['用腰过度后伸来代偿', '耸肩'],
    asSafety: '幅度温和,不顶着腰痛做;锐痛即停。',
    alternative: '站姿靠墙天使替代。',
  },
  {
    id: 'pushup',
    name: '俯卧撑(上斜 / 跪姿 / 标准)',
    target: '胸 / 肩 / 三头 + 核心',
    steps: [
      '按难度选:扶墙 → 上斜(手撑桌沿)→ 跪姿 → 标准',
      '双手略宽于肩,身体保持一条直线',
      '屈肘下放到舒适幅度',
      '推起回到起始位',
    ],
    cues: ['核心收紧、不塌腰', '肘约与躯干成 45 度'],
    mistakes: ['塌腰翘臀', '头部前探'],
    asSafety: '从易到难循序渐进,核心稳定不塌腰;锐痛即停。',
    alternative: '力量不足先做上斜或跪姿版。',
  },
  {
    id: 'glute-bridge',
    name: '臀桥',
    target: '臀 / 后链 / 核心',
    steps: [
      '仰卧屈膝,双脚与髋同宽踩地',
      '收紧臀部,把髋抬到肩 - 髋 - 膝成一条直线',
      '顶峰停约 1 秒',
      '控制着放下',
    ],
    cues: ['臀部发力而非腰', '肋骨下沉、收紧核心'],
    mistakes: ['靠腰顶起(过度后伸)', '脚离躯干太远'],
    asSafety: '抗伸展、不靠腰发力;锐痛即停。',
    alternative: '缩小幅度退阶,或单腿臀桥进阶。',
  },
  {
    id: 'dead-bug',
    name: '死虫',
    target: '核心(抗伸展)',
    steps: [
      '仰卧,双手指向天花板,双髋与膝屈成 90 度',
      '让腰背贴紧地面',
      '缓慢伸直对侧的手与脚到接近地面',
      '收回,换另一侧',
    ],
    cues: ['全程腰背贴地', '动作放慢、保持呼吸'],
    mistakes: ['腰拱起离地', '憋气'],
    asSafety: '腰背贴地、不让脊柱伸展;锐痛即停。',
    alternative: '只动腿、不动手降难度。',
  },
  {
    id: 'split-squat',
    name: '分腿蹲',
    target: '下肢(单侧)/ 臀 / 平衡',
    steps: [
      '前后分腿站立,后脚脚尖点地',
      '垂直向下蹲,后膝朝地面',
      '前脚跟发力站起',
      '两侧组次对等',
    ],
    cues: ['躯干直立', '前膝对齐脚尖'],
    mistakes: ['身体前倾弓腰', '重心不稳晃动'],
    asSafety: '自重或中小重量、两侧对等(顾及侧弯);锐痛即停。',
    alternative: '扶椅 / 墙辅助平衡,或缩小幅度。',
  },
  {
    id: 'floor-press',
    name: '哑铃地面卧推',
    target: '胸 / 肩 / 三头',
    steps: [
      '仰卧地面,双手持哑铃屈肘,上臂贴地',
      '推起到手臂伸直',
      '控制下放到肘部轻触地',
      '重复',
    ],
    cues: ['地面限制肩后伸,更护肩', '手腕保持中立'],
    mistakes: ['耸肩', '砸肘'],
    asSafety: '地面限制肩关节后伸,新手 + AS 更安全;锐痛即停。',
    alternative: '无器械时用俯卧撑替代这个「推」动作。',
  },
  {
    id: 'superman',
    name: '温和 superman',
    target: '后链 / 竖脊肌 / 臀(姿势改善)',
    steps: [
      '俯卧,手臂向前伸展',
      '温和抬起手臂、胸口与双腿离地少许',
      '停留 1–2 秒',
      '缓慢放下',
    ],
    cues: ['幅度小而温和,颈部中立', '臀与背协同发力'],
    mistakes: ['过度后伸顶腰', '猛甩身体'],
    asSafety: '幅度温和、不过度后伸、不顶痛;锐痛即停。',
    alternative: '改做俯卧 YTW 或鸟狗。',
  },
  {
    id: 'bird-dog',
    name: '鸟狗',
    target: '核心(抗旋转)/ 后链',
    steps: [
      '四点跪撑,背部平直',
      '同时伸直对侧的手与腿到与躯干平行',
      '停 1–2 秒,保持骨盆稳定',
      '收回,换另一侧',
    ],
    cues: ['骨盆不旋转、不歪斜', '颈与脊柱保持中立'],
    mistakes: ['塌腰', '骨盆歪斜'],
    asSafety: '抗旋转、缓慢可控、脊柱中立;锐痛即停。',
    alternative: '只伸腿或只伸手降难度。',
  },
  {
    id: 'side-plank',
    name: '侧桥',
    target: '侧核心 / 髋',
    steps: [
      '侧卧,前臂撑地,肘在肩正下方',
      '抬髋使身体成一条直线',
      '保持设定时间',
      '两侧对等',
    ],
    cues: ['身体成一条线', '髋部不下沉'],
    mistakes: ['髋部下塌', '肩部耸起'],
    asSafety: '两侧组次对等,顾及侧弯对称;锐痛即停。',
    alternative: '屈膝侧桥(膝着地)降难度。',
  },
  {
    id: 'cat-cow',
    name: '温和猫牛',
    target: '脊柱活动度',
    steps: [
      '四点跪撑',
      '吸气温和塌腰抬头(牛)',
      '呼气温和拱背低头(猫)',
      '在舒适幅度内缓慢交替',
    ],
    cues: ['配合呼吸', '幅度温和、不到疼痛端'],
    mistakes: ['幅度过大顶痛', '憋气'],
    asSafety: '温和活动度训练,不做到疼痛端;锐痛即停。',
    alternative: '坐姿或站姿做温和的脊柱屈伸。',
  },
  {
    id: 't-rotation',
    name: '胸椎旋转',
    target: '胸椎旋转活动度',
    steps: [
      '四点跪或侧卧',
      '一手扶头或向上伸展',
      '胸椎向上打开旋转,目光随手移动',
      '缓慢回正,两侧对等',
    ],
    cues: ['旋转来自胸椎而非腰', '骨盆保持稳定'],
    mistakes: ['用腰代偿旋转', '速度过快'],
    asSafety: '旋转来自胸椎、骨盆稳定,两侧对等;锐痛即停。',
    alternative: '坐姿做胸椎旋转。',
  },
  {
    id: 'hip-flexor-stretch',
    name: '髋屈肌拉伸',
    target: '髋屈肌(对抗骨盆前倾)',
    steps: [
      '半跪姿,后侧腿的髋部向前送',
      '收紧臀部,找到骨盆后倾的感觉',
      '保持约 30 秒',
      '两侧对等',
    ],
    cues: ['骨盆后倾、不塌腰前顶', '感受前侧髋的拉伸'],
    mistakes: ['塌腰向前顶', '憋气'],
    asSafety: '温和静态拉伸,不到锐痛;锐痛即停。',
    alternative: '站姿弓步轻拉。',
  },
  {
    id: 'hamstring-stretch',
    name: '腘绳肌拉伸',
    target: '大腿后侧',
    steps: [
      '仰卧或坐姿',
      '一腿伸直,温和感受大腿后侧拉伸',
      '尽量从髋部折叠、脊柱保持中立',
      '保持约 30 秒,两侧对等',
    ],
    cues: ['脊柱尽量中立', '动作温和不弹振'],
    mistakes: ['猛拉弹振', '圆背硬够脚尖'],
    asSafety: '避免脊柱大幅屈曲下用力,采用温和静态拉伸;锐痛即停。',
    alternative: '仰卧用毛巾勾住脚掌拉伸,减少弯腰。',
  },
  {
    id: 'chest-opener',
    name: '胸部开门拉伸',
    target: '胸大肌 / 前肩(对抗含胸)',
    steps: [
      '站在门框或墙角旁,前臂贴住框边',
      '身体温和向前倾,打开胸口',
      '保持约 30 秒',
      '两侧对等',
    ],
    cues: ['感受胸前的拉伸', '不耸肩'],
    mistakes: ['幅度过大拉到肩痛', '塌腰'],
    asSafety: '温和拉伸、对抗含胸驼背,不到锐痛;锐痛即停。',
    alternative: '仰卧在泡沫轴上做胸椎伸展。',
  },
  {
    id: 'pelvic-clock',
    name: '骨盆时钟',
    target: '骨盆 / 下背的觉察与活动度',
    steps: [
      '仰卧屈膝',
      '想象骨盆是个时钟,温和前后(12–6 点)移动',
      '再温和左右(3–9 点)移动',
      '缓慢画小圈',
    ],
    cues: ['小幅、缓慢、有觉察', '呼吸放松'],
    mistakes: ['幅度过大', '用力过猛'],
    asSafety: '小幅温和的活动度训练;锐痛即停。',
    alternative: '只做前后方向的骨盆温和倾斜。',
  },
  {
    id: 'gentle-extension',
    name: '温和后伸(眼镜蛇 / 婴儿式交替)',
    target: '脊柱后伸活动度(对抗前屈僵直)',
    steps: [
      '俯卧,双手撑地温和抬起上身到舒适幅度(眼镜蛇)',
      '停留数秒',
      '退回俯卧,或转成婴儿式放松',
      '温和交替',
    ],
    cues: ['幅度温和、颈部中立', '不做到疼痛端'],
    mistakes: ['猛力后伸顶腰', '颈部过度后仰'],
    asSafety: 'AS 重点的后伸方向,但务必温和、不顶痛;若出现夜间痛或锐痛,停止并就医。',
    alternative: '站姿双手扶腰做更小幅度的温和后伸。',
  },
  {
    id: 'breathing',
    name: '扩胸深呼吸',
    target: '胸廓扩张 / 呼吸(对 AS 友好)',
    steps: [
      '坐姿或仰卧,双手放在肋骨两侧',
      '用鼻子深吸气,感受肋廓向两侧扩张',
      '缓慢呼气',
      '重复',
    ],
    cues: ['吸气进到肋廓而非耸肩', '节奏放松'],
    mistakes: ['耸肩式浅呼吸', '过度换气头晕'],
    asSafety: '温和呼吸训练,有助 AS 胸廓活动;不适即停。',
    alternative: '仰卧屈膝做腹式 / 肋式呼吸。',
  },
  {
    id: 'walk',
    name: '快走 / 散步',
    target: '低冲击有氧 / 全身',
    steps: [
      '选平整路面',
      '抬头、收下巴、自然摆臂',
      '配速以能正常说话为准',
      '持续设定时间',
    ],
    cues: ['姿态挺拔、不含胸', '落地轻'],
    mistakes: ['低头含胸快走', '配速过猛喘不上气'],
    asSafety: '低冲击有氧,避免高冲击的跑步、跳跃;不适或锐痛即停。',
    alternative: '室内原地踏步,或缩短时间。',
  },
]

interface EnEntry {
  name_en: string
  target_en: string
  steps_en: string[]
  cues_en: string[]
  mistakes_en: string[]
  asSafety_en: string
  alternative_en: string
  wgerImageCandidate: boolean
}

const EN_RAW = (enContent as { exercises: Record<string, EnEntry> }).exercises

function toEn(e: EnEntry): ExerciseEn {
  return {
    name: e.name_en,
    target: e.target_en,
    steps: e.steps_en,
    cues: e.cues_en,
    mistakes: e.mistakes_en,
    asSafety: e.asSafety_en,
    alternative: e.alternative_en,
  }
}

export const EXERCISE_LIBRARY: Exercise[] = BASE.map((e) => {
  const en = EN_RAW[e.id]
  if (!en) throw new Error(`缺少英文内容: ${e.id}`)
  return { ...e, en: toEn(en) }
})

// wger 抓图阶段(Task 6)会用到:某动作是否被标记为可抓 wger 图。
export function isWgerImageCandidate(id: string): boolean {
  return EN_RAW[id]?.wgerImageCandidate === true
}

const BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISE_LIBRARY.map((e) => [e.id, e]),
)

export function getExercise(id: string): Exercise | undefined {
  return BY_ID[id]
}

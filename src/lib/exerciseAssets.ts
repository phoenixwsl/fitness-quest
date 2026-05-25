import type { WgerImageRef } from '../types'

// 用 Vite glob 把 src/assets/exercises 下的资源按 id 映射;离线打包,运行时不联网。
// SVG 简笔示意图(必备,每个动作一张)。
const svgModules = import.meta.glob('../assets/exercises/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

// wger 补充图片(仅安全筛选通过的动作才有;0..N 张)。
const wgerModules = import.meta.glob('../assets/exercises/wger/*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function basenameId(path: string): string {
  const file = path.split('/').pop() ?? ''
  return file.replace(/\.[^.]+$/, '')
}

const SVG_BY_ID: Record<string, string> = {}
for (const [path, url] of Object.entries(svgModules)) {
  SVG_BY_ID[basenameId(path)] = url
}

const WGER_URL_BY_ID: Record<string, string> = {}
for (const [path, url] of Object.entries(wgerModules)) {
  WGER_URL_BY_ID[basenameId(path)] = url
}

// 经轻量安全审查通过的 wger 图署名;键须与 wger/<id>.<ext> 的 id 对应。
// 仅纳入「动作一致 + 姿态保守 + 图像清晰」的图(11 个候选里仅这 2 个达标)。
const WGER_CREDITS: Record<string, { author?: string }> = {
  'goblet-squat': { author: 'philip / wger.de' },
  'floor-press': { author: 'wger.de' },
}

export function getExerciseSvg(id: string): string | undefined {
  return SVG_BY_ID[id]
}

export function getWgerImage(id: string): WgerImageRef | undefined {
  const src = WGER_URL_BY_ID[id]
  if (!src) return undefined
  return { src, author: WGER_CREDITS[id]?.author, license: 'CC-BY-SA 3.0' }
}

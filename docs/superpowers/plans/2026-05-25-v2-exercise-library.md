# 动作库:示意图 + 中英双语 + wger 图片补充(v2 PR5)实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给动作库每个动作配上必备简笔示意图、补齐中英双语文字内容、并对部分动作叠加经过 AS 安全筛选的 wger 补充图片,完成 v2 里程碑(0.3.0)。

**Architecture:** 静态资源(SVG / wger 图)放进 `src/assets/exercises/`,用 `import.meta.glob` 按动作 id 建映射(离线打包,运行时不调网络);英文内容由 frank 提供的 `exercise-bilingual-content.json` 原样并入 `exerciseLibrary.ts`(不重写英文);动作详情沿用今日页 `ExerciseRow` 的内联展开(不新建子页),展开区中英并列显示并渲染示意图;wger 图片仅对 `wgerImageCandidate` 为 true 的动作尽力抓取,逐张人工视觉安全筛选后才纳入,附 CC-BY-SA 3.0 署名,抓不到/不安全就只用 SVG。

**Tech Stack:** React 19 + TS + Vite(`import.meta.glob` 资源映射 + JSON import)+ Tailwind v4 + Vitest/RTL。

---

## 决策(已与用户确认)

1. **wger 图片:尽力抓取 + 严格安全筛选**。对 11 个 `wgerImageCandidate: true` 的动作尝试抓 wger 图,**逐张用 Read 工具视觉检查**,只纳入明显符合 AS 保守约束(无大重量/无极端幅度/姿态保守)的;抓不到或不安全 → 只用 SVG。署名「部分图片来自 wger(CC-BY-SA 3.0)」。
2. **双语:中英并列同时显示**(动作内容双语,非整个 App 界面切换)。
3. **详情位置:增强现有 `ExerciseRow` 内联展开**(不新建子页,YAGNI)。

## 安全约束(贯穿,最高优先级)

- 不引入任何展示大重量纵向负荷 / 高冲击跑跳 / 壶铃摆动 / 屈曲卷腹 / 极端脊柱后伸的图片或文字。
- wger 图片必须逐张视觉确认安全后才纳入;拿不准一律弃用(更保守)。
- 英文文字内容来自素材包(已由教练角色按 §2 筛过),原样并入,不自行改写。
- 现有 AS-banned 关键字测试需同时覆盖新增英文内容。

## 文件结构

```
src/
  assets/exercises/<id>.svg          (新建 ×21: 复制自 pr5-assets/exercises)
  assets/exercises/wger/<id>.<ext>   (新建 0..11: 仅安全筛选通过的 wger 图)
  data/exerciseContent.en.json       (新建: 复制自 pr5-assets,英文内容原样)
  data/exerciseLibrary.ts            (改: 并入 en 字段)
  data/exerciseLibrary.test.ts       (改: 新增 en 完整性 + en 安全断言)
  lib/exerciseAssets.ts              (新建: id→SVG / id→wger 图 映射 + 署名)
  lib/exerciseAssets.test.ts         (新建)
  components/ExerciseRow.tsx         (改: 渲染示意图 + 中英并列 + wger 署名)
  components/ExerciseRow.test.tsx    (改: 示意图 / 双语 / 优雅降级)
  types.ts                           (改: Exercise.en + ExerciseEn + WgerImageRef)
tsconfig.app.json                    (改: resolveJsonModule)
docs/wger对比与演进方向.md           (纳入提交,未跟踪)
package.json                         (改: 0.2.3 → 0.3.0)
CLAUDE.md                            (改: 版本管理里程碑行)
pr5-assets/                          (删除: 整合后移除临时目录)
```

---

## Task 1: 开分支 + 落地静态素材 + JSON 配置

**Files:**
- Create: `src/assets/exercises/<21 ids>.svg`(复制)
- Create: `src/data/exerciseContent.en.json`(复制)
- Modify: `tsconfig.app.json`

- [ ] **Step 1: 从最新 main 开分支**

```bash
git checkout main && git pull --ff-only
git checkout -b feat/v2-exercise-library
```

- [ ] **Step 2: 复制 21 张 SVG 到 src/assets/exercises/**

```bash
mkdir -p src/assets/exercises
cp pr5-assets/exercises/*.svg src/assets/exercises/
ls src/assets/exercises/ | wc -l   # 期望 21
```

- [ ] **Step 3: 复制英文内容 JSON 到 src/data/**

```bash
cp pr5-assets/exercise-bilingual-content.json src/data/exerciseContent.en.json
```

- [ ] **Step 4: 开启 resolveJsonModule(允许 tsc 类型检查 JSON import)**

在 `tsconfig.app.json` 的 `compilerOptions` 里,`"jsx": "react-jsx",` 一行后新增:

```jsonc
    "jsx": "react-jsx",
    "resolveJsonModule": true,
```

- [ ] **Step 5: 验证构建仍绿(素材此时未被引用)**

Run: `npm run build`
Expected: 成功(tsc -b 通过 + vite build 产物生成)。

- [ ] **Step 6: Commit**

```bash
git add src/assets/exercises src/data/exerciseContent.en.json tsconfig.app.json
git commit -m "chore: vendor exercise SVGs + English content into src (v2 PR5)"
```

注:pre-commit hook 会跑 test+build,务必本地已绿。

---

## Task 2: 扩展 Exercise 类型(双语 + wger 图)

**Files:**
- Modify: `src/types.ts:16-27`

- [ ] **Step 1: 在 Exercise 接口前后新增类型,并给 Exercise 加 en 字段**

把 `src/types.ts` 中现有的 Exercise 接口(第 16–27 行附近)替换为:

```ts
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
```

- [ ] **Step 2: 验证类型(此时 exerciseLibrary 尚未提供 en,会报错——预期,下个 Task 修)**

Run: `npx tsc -b --noEmit 2>&1 | head`
Expected: 报 `exerciseLibrary.ts` 缺少 `en` 属性(确认类型已生效)。先不提交,进入 Task 3。

---

## Task 3: 把英文内容并入 EXERCISE_LIBRARY

**Files:**
- Modify: `src/data/exerciseLibrary.ts`
- Modify: `src/data/exerciseLibrary.test.ts`

- [ ] **Step 1: 先写失败测试(en 完整性 + en 覆盖全部 id + AS 安全覆盖英文)**

在 `src/data/exerciseLibrary.test.ts` 的 `describe('exerciseLibrary', ...)` 内追加:

```ts
  it('每条动作含完整英文镜像', () => {
    for (const ex of EXERCISE_LIBRARY) {
      expect(ex.en.name, `${ex.id} 缺 en.name`).toBeTruthy()
      expect(ex.en.target, `${ex.id} 缺 en.target`).toBeTruthy()
      expect(ex.en.steps.length, `${ex.id} 缺 en.steps`).toBeGreaterThan(0)
      expect(ex.en.cues.length, `${ex.id} 缺 en.cues`).toBeGreaterThan(0)
      expect(ex.en.mistakes.length, `${ex.id} 缺 en.mistakes`).toBeGreaterThan(0)
      expect(ex.en.asSafety, `${ex.id} 缺 en.asSafety`).toBeTruthy()
      expect(ex.en.alternative, `${ex.id} 缺 en.alternative`).toBeTruthy()
    }
  })

  it('AS 安全:英文内容也无被禁关键字(英文等价)', () => {
    const BANNED_EN = ['kettlebell swing', 'sit-up', 'sit up', 'crunch', 'deadlift', 'overhead press', 'box jump', 'jumping']
    for (const ex of EXERCISE_LIBRARY) {
      const blob = JSON.stringify(ex.en).toLowerCase()
      for (const bad of BANNED_EN) {
        expect(blob, `${ex.id} 英文含被禁关键字 ${bad}`).not.toContain(bad)
      }
    }
  })
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/data/exerciseLibrary.test.ts`
Expected: FAIL(`ex.en` 为 undefined)。

- [ ] **Step 3: 在 exerciseLibrary.ts 顶部并入英文内容**

`src/data/exerciseLibrary.ts` 改动:
1. 顶部 import 改为:

```ts
import type { Exercise, ExerciseEn } from '../types'
import enContent from './exerciseContent.en.json'
```

2. 把现有 `export const EXERCISE_LIBRARY: Exercise[] = [ ... ]` 这一行的**变量名**改为内部基表(去掉 export、改名 BASE),即:

```ts
const BASE: Omit<Exercise, 'en'>[] = [
  // ……(原有 21 条中文条目原样保留,一字不改)……
]
```

3. 在 `const BY_ID` 之前,新增英文合并逻辑与导出:

```ts
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
```

4. `BY_ID` / `getExercise` 保持不变(它们引用的是导出的 `EXERCISE_LIBRARY`)。

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/data/exerciseLibrary.test.ts`
Expected: PASS(含原有 5 条 + 新增 2 条)。

- [ ] **Step 5: 类型 + 全量测试**

Run: `npm run build && npm run test`
Expected: 全绿。

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/data/exerciseLibrary.ts src/data/exerciseLibrary.test.ts
git commit -m "feat: add bilingual (zh/en) content to exercise library"
```

---

## Task 4: 资源映射层 exerciseAssets

**Files:**
- Create: `src/lib/exerciseAssets.ts`
- Create: `src/lib/exerciseAssets.test.ts`

- [ ] **Step 1: 写失败测试**

`src/lib/exerciseAssets.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getExerciseSvg, getWgerImage } from './exerciseAssets'
import { EXERCISE_LIBRARY, isWgerImageCandidate } from '../data/exerciseLibrary'

describe('exerciseAssets', () => {
  it('每个动作都有简笔示意图(必备主视觉)', () => {
    for (const ex of EXERCISE_LIBRARY) {
      expect(getExerciseSvg(ex.id), `${ex.id} 缺 SVG`).toBeTruthy()
    }
  })

  it('未知 id 的示意图返回 undefined(优雅降级)', () => {
    expect(getExerciseSvg('does-not-exist')).toBeUndefined()
  })

  it('wger 图只可能挂在被标记为 candidate 的动作上,且带署名', () => {
    for (const ex of EXERCISE_LIBRARY) {
      const w = getWgerImage(ex.id)
      if (w) {
        expect(isWgerImageCandidate(ex.id), `${ex.id} 非 candidate 却有 wger 图`).toBe(true)
        expect(w.src).toBeTruthy()
        expect(w.license).toBe('CC-BY-SA 3.0')
      }
    }
  })
})
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/lib/exerciseAssets.test.ts`
Expected: FAIL(模块不存在)。

- [ ] **Step 3: 实现 exerciseAssets.ts**

```ts
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

// 经 Task 6 人工安全筛选通过的 wger 图署名;键须与 wger/<id>.<ext> 的 id 对应。
// 初始为空;Task 6 加入安全图片时按 id 填入作者。
const WGER_CREDITS: Record<string, { author?: string }> = {}

export function getExerciseSvg(id: string): string | undefined {
  return SVG_BY_ID[id]
}

export function getWgerImage(id: string): WgerImageRef | undefined {
  const src = WGER_URL_BY_ID[id]
  if (!src) return undefined
  return { src, author: WGER_CREDITS[id]?.author, license: 'CC-BY-SA 3.0' }
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/lib/exerciseAssets.test.ts`
Expected: PASS(此时 wger 目录为空,第 3 条测试因 `getWgerImage` 全返回 undefined 而平凡通过)。

- [ ] **Step 5: Commit**

```bash
git add src/lib/exerciseAssets.ts src/lib/exerciseAssets.test.ts
git commit -m "feat: add exercise asset map (svg + wger image lookup)"
```

---

## Task 5: ExerciseRow 渲染示意图 + 中英并列 + wger 署名

**Files:**
- Modify: `src/components/ExerciseRow.tsx`
- Modify: `src/components/ExerciseRow.test.tsx`

- [ ] **Step 1: 写失败测试**

在 `src/components/ExerciseRow.test.tsx` 追加(若文件结构不同,按既有 render 辅助方式适配;以下用直接 render):

```tsx
import { getExercise } from '../data/exerciseLibrary'

it('展开后渲染该动作的简笔示意图(alt 含动作名)', () => {
  const ex = getExercise('goblet-squat')!
  render(<ExerciseRow exercise={ex} name={ex.name} prescription="3×10" count={0} />)
  // 新手期默认展开
  const img = screen.getByRole('img', { name: /高脚杯深蹲/ })
  expect(img).toBeInTheDocument()
})

it('展开后中英并列:同时出现中文与英文要点', () => {
  const ex = getExercise('goblet-squat')!
  render(<ExerciseRow exercise={ex} name={ex.name} prescription="3×10" count={0} />)
  expect(screen.getByText('Goblet Squat')).toBeInTheDocument()
  expect(screen.getByText(/重心落在全脚掌/)).toBeInTheDocument()
  expect(screen.getByText(/Weight on the whole foot/)).toBeInTheDocument()
})

it('无匹配示意图时优雅降级:不渲染 img', () => {
  const fake = { ...getExercise('goblet-squat')!, id: 'no-such-svg' }
  render(<ExerciseRow exercise={fake} name="测试" prescription="1×1" count={0} />)
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})
```

确认测试文件顶部已 import `render, screen`(RTL)。

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/components/ExerciseRow.test.tsx`
Expected: FAIL(无 img / 无英文文本)。

- [ ] **Step 3: 改 ExerciseRow.tsx**

1. 顶部新增 import:

```ts
import { getExerciseSvg, getWgerImage } from '../lib/exerciseAssets'
```

2. 把 `DetailText` / `DetailList` 升级为支持英文并列(中文在上,英文在下、更淡):

```tsx
function DetailText({ title, text, textEn }: { title: string; text: string; textEn?: string }) {
  return (
    <div className="text-xs text-slate-600">
      <span className="font-semibold text-slate-500">{title}:</span> {text}
      {textEn && <p className="text-slate-400">{textEn}</p>}
    </div>
  )
}

function DetailList({ title, items, itemsEn }: { title: string; items: string[]; itemsEn?: string[] }) {
  return (
    <div className="text-xs text-slate-600">
      <span className="font-semibold text-slate-500">{title}:</span>
      <ul className="mt-0.5 flex flex-col gap-0.5 pl-3">
        {items.map((it, i) => (
          <li key={it} className="list-disc">
            {it}
            {itemsEn?.[i] && <span className="block text-slate-400">{itemsEn[i]}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

3. 在组件内,展开区渲染前取资源:

```tsx
  const svg = exercise ? getExerciseSvg(exercise.id) : undefined
  const wger = exercise ? getWgerImage(exercise.id) : undefined
```

4. 标题处的动作名下补英文名(中英并列):把现有

```tsx
        <span className="font-medium text-slate-800">
          {name}
          <span className="ml-1 text-xs text-slate-400">{expanded ? '收起' : '展开'}</span>
        </span>
```

改为:

```tsx
        <span className="font-medium text-slate-800">
          {name}
          {exercise?.en.name && (
            <span className="ml-1 text-xs font-normal text-slate-400">{exercise.en.name}</span>
          )}
          <span className="ml-1 text-xs text-slate-400">{expanded ? '收起' : '展开'}</span>
        </span>
```

5. 把展开区 `{expanded && exercise && ( ... )}` 整块替换为(含示意图 + 中英并列 + wger 图 + 署名):

```tsx
      {expanded && exercise && (
        <div className="mt-2 flex flex-col gap-1.5 rounded-lg bg-slate-50 p-3">
          {svg && (
            <img
              src={svg}
              alt={`${exercise.name} 示意图`}
              className="mx-auto h-32 w-auto"
              loading="lazy"
            />
          )}
          {wger && (
            <figure className="m-0">
              <img
                src={wger.src}
                alt={`${exercise.name} 参考图`}
                className="mx-auto max-h-40 w-auto rounded"
                loading="lazy"
              />
              <figcaption className="mt-0.5 text-center text-[10px] text-slate-400">
                部分图片来自 wger(CC-BY-SA 3.0){wger.author ? ` · ${wger.author}` : ''}
              </figcaption>
            </figure>
          )}
          <DetailText title="目标部位" text={exercise.target} textEn={exercise.en.target} />
          <DetailList title="怎么做" items={exercise.steps} itemsEn={exercise.en.steps} />
          <DetailList title="要领" items={exercise.cues} itemsEn={exercise.en.cues} />
          <DetailList title="常见错误" items={exercise.mistakes} itemsEn={exercise.en.mistakes} />
          <DetailText title="AS 安全" text={exercise.asSafety} textEn={exercise.en.asSafety} />
          <DetailText title="替代动作" text={exercise.alternative} textEn={exercise.en.alternative} />
        </div>
      )}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/components/ExerciseRow.test.tsx`
Expected: PASS。

- [ ] **Step 5: 全量测试 + 构建**

Run: `npm run test && npm run build`
Expected: 全绿(注意此前 TodayPage 等用到 ExerciseRow 的测试不应回归)。

- [ ] **Step 6: Commit**

```bash
git add src/components/ExerciseRow.tsx src/components/ExerciseRow.test.tsx
git commit -m "feat: show exercise diagram + bilingual detail in ExerciseRow"
```

---

## Task 6: wger 图片抓取 + 严格 AS 安全筛选(尽力,可零产出)

> 这是一次性「素材采集 + 人工安全审查」步骤,不是单元测试。产物 = `src/assets/exercises/wger/` 下若干安全图片 + `exerciseAssets.ts` 里的 `WGER_CREDITS` 署名。**抓不到 / 不安全就跳过,只用 SVG**——这是被允许的结果。

**Files:**
- Create(0..11): `src/assets/exercises/wger/<id>.<ext>`
- Modify(若有产出): `src/lib/exerciseAssets.ts`(填 `WGER_CREDITS`)
- Possibly modify: `src/lib/exerciseAssets.test.ts`(若有产出,加「至少含某 id」断言可选)

候选(`wgerImageCandidate: true`,共 11):`goblet-squat, bw-squat, db-row, pushup, glute-bridge, dead-bug, split-squat, floor-press, superman, bird-dog, side-plank`。

- [ ] **Step 1: 探明 wger 图片 API 端点**

wger 公开 API(无需鉴权,只读)。先确认可用端点(搜索端点可能随版本变化):

```bash
# 列举带图片的动作(确认 API 可达 + 字段结构)
curl -s -m 10 "https://wger.de/api/v2/exerciseimage/?format=json&limit=2" | head -c 800; echo
# 按英文名搜索动作 base(若 search 端点 404,改用 exercise/?language=2&name=...)
curl -s -m 10 "https://wger.de/api/v2/exercise/?format=json&language=2&limit=5&name=Bird%20Dog" | head -c 800; echo
```

记录可用的「按名/uuid 找 exercise → 找其 exerciseimage.image URL」路径。`exerciseimage` 对象含 `image`(图片 URL)、`license_author`(署名)。

- [ ] **Step 2: 对每个候选动作抓取候选图到临时目录**

对 11 个候选逐个:用英文名(见 `exerciseContent.en.json` 的 `name_en`)查 wger,取其 `exerciseimage.image` 下载到 `/tmp/wger/<id>.<ext>`,同时记下 `license_author`。示例:

```bash
mkdir -p /tmp/wger
# 示例:bird dog
curl -s -m 15 -o /tmp/wger/bird-dog.png "<bird-dog 的 image URL>"
```

抓不到对应动作或无图片 → 跳过该 id(正常)。

- [ ] **Step 3: 逐张视觉安全审查(关键安全门)**

对 `/tmp/wger/` 下每张图,用 Read 工具打开**逐张人眼检查**,只保留同时满足以下全部条件的:

- 动作与本项目同名动作一致(不是张冠李戴);
- 姿态保守:无大重量杠铃 / 无极端脊柱屈伸 / 无高冲击 / 无壶铃摆动;
- 双侧动作呈对称合理姿态;
- 图像清晰、无水印干扰、无明显误导。

任何一条拿不准 → **弃用**(更保守)。把通过的复制到 `src/assets/exercises/wger/<id>.<ext>`:

```bash
mkdir -p src/assets/exercises/wger
cp /tmp/wger/<id>.<ext> src/assets/exercises/wger/<id>.<ext>   # 仅通过审查的
```

- [ ] **Step 4: 为通过的图片填写署名**

在 `src/lib/exerciseAssets.ts` 的 `WGER_CREDITS` 里,为每个纳入的 id 填作者(来自 `license_author`):

```ts
const WGER_CREDITS: Record<string, { author?: string }> = {
  // 例:'bird-dog': { author: 'wger.de' },
}
```

- [ ] **Step 5: 验证(含「图只挂 candidate 且带署名」不变量)**

Run: `npm run test && npm run build`
Expected: 全绿。`exerciseAssets.test.ts` 的第 3 条会校验任何纳入的 wger 图都挂在 candidate 上、带 `CC-BY-SA 3.0`、且 src 非空。手动确认详情页该动作下出现参考图 + 署名脚注。

- [ ] **Step 6: Commit(若零产出则跳过本提交)**

```bash
git add src/assets/exercises/wger src/lib/exerciseAssets.ts
git commit -m "feat: add AS-safety-screened wger reference images (CC-BY-SA 3.0)"
```

> 若审查后无任何图片通过:不创建 wger 目录、不改 `WGER_CREDITS`,在 PR 描述里记录「wger 图均未通过 AS 安全审查 / 无匹配,详情页仅用简笔示意图」。

---

## Task 7: 清理 + 文档 + 版本 0.3.0 + PR

**Files:**
- Delete: `pr5-assets/`
- Add(纳入提交): `docs/wger对比与演进方向.md`
- Modify: `package.json`(version)
- Modify: `CLAUDE.md`(版本管理里程碑行)

- [ ] **Step 1: 删除临时素材目录**

```bash
git rm -r --cached pr5-assets 2>/dev/null; rm -rf pr5-assets
ls pr5-assets 2>&1   # 期望 No such file or directory
```

- [ ] **Step 2: 升版本 0.2.3 → 0.3.0**

编辑 `package.json`:`"version": "0.2.3"` → `"version": "0.3.0"`。

- [ ] **Step 3: 更新 CLAUDE.md 版本管理里程碑行**

把 `## 版本管理` 节中

```
里程碑对应:v0 = 0.1.0、v1 = 0.2.0(已完成),v2 开发中。
```

改为:

```
里程碑对应:v0 = 0.1.0、v1 = 0.2.0、v2 = 0.3.0(已完成),v3 待规划。
```

- [ ] **Step 4: 全量验证**

Run: `npm run lint && npm run test && npm run build`
Expected: 全绿。

- [ ] **Step 5: Commit(含文档与版本)**

```bash
git add -A
git commit -m "chore: drop pr5-assets, add wger reference doc, bump to v0.3.0 (v2 done)"
```

- [ ] **Step 6: 推分支 + 开 PR**

```bash
git push -u origin feat/v2-exercise-library
gh pr create --title "v2: 动作库示意图 + 中英双语 + wger 补充 (v0.3.0)" --body "$(cat <<'EOF'
## Summary
- 每个动作配必备简笔示意图(SVG,离线打包),详情页内联展开渲染,缺图优雅降级
- 动作内容补齐中英双语(来自素材包,原样并入),详情中英并列显示
- 对 wgerImageCandidate 动作尽力抓 wger 图,逐张人工 AS 安全审查后纳入,附 CC-BY-SA 3.0 署名(未过审/无匹配则仅用 SVG)
- 清理 pr5-assets/ 临时目录,纳入 docs/wger对比与演进方向.md
- 版本 0.2.3 → 0.3.0(v2 里程碑完成)

## Test plan
- [ ] npm run lint / test / build 全绿,CI 绿
- [ ] 动作库 AS 安全:中英文均无被禁关键字(单测覆盖)
- [ ] 详情页:示意图显示 + 中英并列 + wger 图(若有)带署名
- [ ] 缺图动作优雅降级(仅文字)
- [ ] wger 图均挂在 candidate 上且带署名(单测不变量)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 7: 等 CI 绿**

```bash
gh pr checks --watch
```

CI 绿后交给 frank 合并(frank 自行管理 main 合并)。

---

## Task 8: 合并后打里程碑 tag(post-merge)

> 待 PR 合并到 main 后执行(由 frank 合并;合并后在 main 上打 tag)。

- [ ] **Step 1: 在合并后的 main 上打 tag**

```bash
git checkout main && git pull --ff-only
git tag v0.3.0
git push origin v0.3.0
```

---

## 安全自检(合并前逐项确认)

- [ ] 21 张 SVG 全部纳入,详情页每个动作都显示示意图;缺图(理论上无)优雅降级仅文字。
- [ ] 英文内容原样来自素材包,未自行改写;中英并列显示完整。
- [ ] AS-banned 关键字测试同时覆盖中文与英文,全绿。
- [ ] 纳入的每张 wger 图都经过逐张视觉审查,姿态保守、无大重量/极端幅度/高冲击/摆动;拿不准的已弃用。
- [ ] 每张 wger 图都带 CC-BY-SA 3.0 署名;无图动作仅用 SVG。
- [ ] 不确定一律按更保守处理。
```
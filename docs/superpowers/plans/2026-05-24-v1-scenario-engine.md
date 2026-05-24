# 健身大闯关 · v1 实施计划

> **For agentic workers:** 用 superpowers:test-driven-development 逐任务实现。先写测试再写实现。每个 PR 跑通 `npm run test` + `npm run build`,全绿再合并。

**Goal:** 在 v0 基础上加入「场景系统(时间段+器械)」「首启健康须知」「动作库+详情+详细度衰减」「动态计划引擎(§5)」「照片时间线」。

**Architecture:** 计划即数据;引擎是纯函数(输入昨晚复盘+历史 → 输出次日训练类型),与场景(用户每次另选)解耦;最终计划 = 训练类型 × 场景(时间段+器械)。全程本地优先、离线可用。

**Tech Stack:** React 19 + TS + Vite + Tailwind v4 + idb;Vitest + RTL + fake-indexeddb。

---

## 当前状态(开工前)

- v0 已合并并推送到 `main`(`597834f`)。当前在 `main`。
- `设计文档.md` 有未提交的 v0.3 改动(场景化:§1.1/§6.2/§6.4/FR1/FR7/§10/附录B)→ **归入 PR1 提交**。
- 已确认决策(本轮提问):
  1. **场景按天记住**:今天选的场景按日期存 IndexedDB,当天重开仍是上次选择,可重选;次日重选。
  2. **完成次数:整体完成即全部 +1**:复盘训练状态=完成/部分完成时,给当天该场景计划里每个动作 +1;**默认完成 ≥5 次自动折叠**。
  3. **引擎存每日计划 + 兜底活动度**:每次生成把「类型+理由」按日期存 `dailyPlan`,由 `dailyPlan`+`checkIn` 推算历史;无历史/漏复盘时今天默认温和活动度/体态日。
  4. **手动覆盖:本期不做**(留后续)。

## PR 流程与依赖

5 个独立分支,从 `main` 切出,顺序:**PR1 → PR3 → PR4** 有依赖(PR3 用 PR1 的器械变体;PR4 替换 PR1 的轮换);**PR2、PR5 相对独立**。`gh` 未安装,我无法开/合 PR;每个 PR 我推分支后**暂停**,你在 GitHub 开 PR、等 CI 绿、合并到 `main`,我再从更新后的 `main` 切下一个分支。(若你希望我连续 stack,不等合并,告诉我即可。)

每个 PR 含明确「**先给你确认**」的检查点:PR1 = 徒手力量动作清单;PR3 = 动作详情文案清单;PR4 = 引擎规则测试用例清单。

---

# PR1 · 场景系统(时间段 + 器械)

分支:`feat/v1-scenario`(从 `main`)

## ⚠️ 待确认①:徒手(无器械)力量动作清单

> 全部出自 §2.5 安全池;徒手「拉」用俯卧后链动作替代(YTW / superman),符合 §2.3 双侧对称。请确认。

**力量 A · 有器械(沿用 v0,不变):** 高脚杯深蹲 3×10 · 哑铃单臂支撑划船 3×10/侧 · 上斜或标准俯卧撑 3 组 · 臀桥 3×12 · 死虫 3×8/侧
**力量 A · 无器械(新):**
1. 自重深蹲 3×12(椅子辅助→自由,躯干中立)
2. 俯卧 YTW 3×8(替代「拉」,上背/后链;俯卧、拇指朝上)
3. 上斜或跪姿到标准俯卧撑 3 组
4. 臀桥 3×12
5. 死虫 3×8/侧

**力量 B · 有器械(沿用 v0,不变):** 分腿蹲 3×8/侧 · 哑铃地面卧推 3×10 · 哑铃单臂支撑划船 3×10/侧 · 鸟狗 3×8/侧 · 侧桥 3×20–30 秒/侧
**力量 B · 无器械(新):**
1. 分腿蹲(自重) 3×8/侧
2. 上斜或跪姿到标准俯卧撑 3 组(替代地面卧推)
3. 温和 superman 3×8(替代「拉」,后链;不过度后伸、不顶痛)
4. 鸟狗 3×8/侧
5. 侧桥 3×20–30 秒/侧

**活动度日 / 恢复日 / 休息日:** 基本徒手,有器械与无器械**共用同一清单**(沿用 v0 内容),无需变体。

## 时间段对热身与提示的影响(不改动作清单)

- **上午**:晨僵期,热身加倍、起步更慢;提示「上午常有晨僵,先温和活动 2–3 分钟再开始,顶着锐痛不练」。额外热身:`['晨僵未消时先做 2–3 分钟温和活动度再正式开始', '热身动作放慢、多做一组']`。
- **下午**:身体已活动开,常规热身;提示「按常规热身即可」。无额外热身。
- **晚上**:偏温和、留睡前缓冲;提示「晚间偏温和,临近睡前再降一档,大强度往前压」。额外热身:`['临近睡前则强度再降一档']`。

## 文件结构(PR1)

```
设计文档.md            (提交 v0.3 改动)
src/types.ts           (改:加 TimeOfDay/Equipment/Scenario;DayPlan→TrainingTypePlan,morningTitle→sessionTitle,main→{equipped,bodyweight})
src/data/planTemplate.ts (重构:类型键控 + 器械变体 + TIME_OF_DAY)
src/data/planTemplate.test.ts (更新+新增)
src/db/index.ts        (改:加 scenarios store + getScenario/putScenario)
src/db/index.test.ts   (新增 scenario 往返测试)
src/components/ScenarioPicker.tsx (新建)
src/components/ScenarioPicker.test.tsx
src/pages/TodayPage.tsx  (改:先选场景→渲染 类型×器械 + 时间段热身/提示)
src/pages/TodayPage.test.tsx (更新)
src/App.test.tsx       (更新:今日页默认文案变化)
```

## 类型变更(src/types.ts)

```ts
export type PlanType = 'strengthA' | 'strengthB' | 'mobility' | 'recovery' | 'rest'
export type TimeOfDay = 'morning' | 'afternoon' | 'evening'
export type Equipment = 'equipped' | 'bodyweight'

export interface ExerciseItem { name: string; prescription: string; note?: string }

export interface TrainingTypePlan {
  type: PlanType
  label: string                 // "力量 A"
  sessionTitle: string          // 时间中性,如 "主训练 · 约 35 分钟"(时间段前缀由今日页拼)
  main: { equipped: ExerciseItem[]; bodyweight: ExerciseItem[] } // 非力量日两键指向同一清单
  safetyNote: string
  eveningMobility: string[]
  minimumVersion: string
  diet: string
  water: string
}

export interface Scenario { date: string; timeOfDay: TimeOfDay; equipment: Equipment }
```
(`CheckIn`/`Photo`/`Metric` 不变。)

## planTemplate 重构(src/data/planTemplate.ts)

- `TIME_OF_DAY: Record<TimeOfDay, { label: string; warmupExtra: string[]; tip: string }>`(内容见上)。
- 五个 `TrainingTypePlan`:`strengthA`/`strengthB`(各含 equipped+bodyweight)、`mobility`/`recovery`/`rest`(两键同清单)。
- `TYPE_CYCLE: PlanType[] = ['strengthA','mobility','strengthB','recovery','strengthA','mobility','rest']`(§6.4,PR1 暂仍用锚点轮换决定类型;PR4 由引擎替换)。
- `getTypeForDayIndex(i: number): PlanType` = `TYPE_CYCLE[((i%7)+7)%7]`。
- `getPlanForType(type: PlanType): TrainingTypePlan`。

### 任务 1.1:提交设计文档 + 类型与 planTemplate 重构(TDD)
- [ ] 更新 `planTemplate.test.ts`:类型序列断言改用 `TYPE_CYCLE`;新增「每个力量类型 equipped 与 bodyweight 各非空」「bodyweight 不含被禁关键字 swing/摆动/卷腹/仰卧起坐/硬拉」「bodyweight A 含 自重深蹲 与 俯卧 YTW」「bodyweight B 含 温和 superman」「TIME_OF_DAY 三档齐全且 morning 有额外热身」。先跑红。
- [ ] 改 `types.ts` + 重构 `planTemplate.ts`(用上面确认的清单)。跑绿。
- [ ] `git add 设计文档.md src/types.ts src/data/planTemplate.ts src/data/planTemplate.test.ts && commit "feat: scenario-aware plan template (time-of-day + equipment variants)"`(设计文档 v0.3 一并提交)。

### 任务 1.2:scenarios 存储(TDD)
- [ ] `db/index.test.ts` 加:`putScenario/getScenario 按日期往返`;`getScenario 不存在返回 undefined`。跑红。
- [ ] `db/index.ts` 加 `scenarios` store(keyPath `'date'`,**DB version 升到 2**,upgrade 里建新 store)+ `getScenario(date)`/`putScenario(s)`。跑绿。
- [ ] commit `"feat: persist daily scenario in IndexedDB"`。

### 任务 1.3:ScenarioPicker(TDD)
- [ ] `ScenarioPicker.test.tsx`:渲染时间段(上午/下午/晚上)与器械(有器械/无器械)选项;选择后点「开始」回调 `onConfirm(timeOfDay, equipment)`;支持传入默认值预选。先红。
- [ ] 实现 `ScenarioPicker.tsx`(受控,pill 单选两组 + 确认按钮)。跑绿。commit。

### 任务 1.4:TodayPage 接场景(TDD)
- [ ] 行为:挂载取锚点→`getTypeForDayIndex`→type;`getScenario(today)`。若无场景→显示 ScenarioPicker;选定→`putScenario`→渲染。已存场景→直接渲染,顶部有「重选场景」。渲染:`{时间段label} · {sessionTitle}`、热身=基础+`warmupExtra`、`main[equipment]` 动作清单、`tip` 提示、晚间体态/饮食/喝水/最低版本(与时段无关)。休息日不渲染动作。
- [ ] 更新 `TodayPage.test.tsx`(mock `getScenario`/`putScenario`/`getAnchorDate`):无场景显示选择器;选「下午+有器械」后显示「高脚杯深蹲」;选「无器械」显示「自重深蹲」、不显示「高脚杯深蹲」;上午显示晨僵提示;可「重选场景」。先红→实现→绿。
- [ ] 更新 `App.test.tsx`(今日页首屏现在是场景选择,断言改为出现「选择场景」之类)。
- [ ] `npm run test` + `npm run build` 全绿。commit。推 `feat/v1-scenario`,暂停等合并。

---

# PR2 · 首次启动健康须知

分支:`feat/v1-health-notice`(从合并后的 `main`)

实现 §2.1:首启展示一次健康免责 + 建议先做风湿科/康复科评估,确认后写本地标记,之后不再弹。

## 文件结构
```
src/db/index.ts        (改:settings 加 healthNoticeAck;getHealthAck/setHealthAck)
src/db/index.test.ts   (新增)
src/components/HealthNotice.tsx (新建)
src/components/HealthNotice.test.tsx
src/App.tsx            (改:未确认则覆盖显示 HealthNotice)
src/App.test.tsx       (新增)
```

### 任务 2.1:确认标记存储(TDD)
- [ ] 测试:`getHealthAck` 默认 false;`setHealthAck(true)` 后 `getHealthAck` 返回 true。先红。
- [ ] `db/index.ts`:settings 记录扩展 `{ anchorDate, healthNoticeAck? }`;`getHealthAck()/setHealthAck(v)`(读写同一 `app` 记录,保留 anchorDate)。跑绿。commit。

### 任务 2.2:HealthNotice + App 门(TDD)
- [ ] `HealthNotice.test.tsx`:渲染免责要点 + §2.1 专业评估建议 + 红旗提示;点「我已知悉」触发 `onAck`。先红→实现→绿。
- [ ] `App.test.tsx`:未确认时显示健康须知、**不**显示今日页;点确认后写库并进入今日页;已确认(预置 ack)时不显示须知。先红。
- [ ] `App.tsx`:`useEffect` 读 `getHealthAck`;false 则渲染 `<HealthNotice onAck={() => { setHealthAck(true); ... }}/>` 覆盖层,确认后进主界面。跑绿。`test`+`build` 绿。commit、推、暂停等合并。

---

# PR3 · 动作库 + 动作详情 + 详细度衰减(重点)

分支:`feat/v1-exercise-library`(从合并后的 `main`)

## ⚠️ 待确认②:动作详情文案清单(执行 PR3 时先整理成清单给你定稿)

动作库覆盖两套力量(equipped+bodyweight)及活动度/恢复/晚间/热身用到的**所有动作**(约 22 个)。每条:`目标部位 / 怎么做(分步) / 要领 / 常见错误 / AS 安全提示 / 替代动作`。文案保守、符合 §2;力量动作给完整详解,拉伸/热身给简洁详解。**v1 只用文字详解,不放示范图**(`imageUrl` 字段留空)。覆盖清单:高脚杯深蹲、自重深蹲、哑铃单臂支撑划船、俯卧 YTW、(上斜/跪姿/标准)俯卧撑、臀桥、死虫、分腿蹲、哑铃地面卧推、温和 superman、鸟狗、侧桥、温和猫牛、胸椎旋转、髋屈肌拉伸、腘绳肌拉伸、胸部开门拉伸、骨盆时钟、温和后伸、扩胸深呼吸、收下巴、靠墙天使、髋绕环、快走/散步。

## 数据模型
```ts
export interface Exercise {
  id: string            // 'goblet-squat' 等
  name: string
  target: string        // 目标部位
  steps: string[]       // 分步怎么做
  cues: string[]        // 要领
  mistakes: string[]    // 常见错误
  asSafety: string      // AS 安全提示
  alternative: string   // 替代动作
  imageUrl?: string     // v1 留空
}
```
- `planTemplate` 的 `ExerciseItem` 增加 `exerciseId: string`(关联动作库)。
- `exercise` store(keyPath `id`)存累计完成次数:用单独记录 `{ id, completedCount }`(`exerciseCounts` store)避免改静态库;或库静态、计数单独存。**决定:库静态在 `exerciseLibrary.ts`;计数存 `exerciseCounts` store**(`getCount(id)/incrementCounts(ids[])`)。
- 衰减阈值常量 `COLLAPSE_THRESHOLD = 5`。

## 文件结构
```
src/data/exerciseLibrary.ts (新建:Exercise[] + getExercise(id))
src/data/exerciseLibrary.test.ts
src/data/planTemplate.ts    (改:ExerciseItem 加 exerciseId)
src/db/index.ts             (改:exerciseCounts store v3 + getCount/getAllCounts/incrementCounts)
src/db/index.test.ts
src/lib/decay.ts            (新建:shouldCollapse(count, threshold))
src/lib/decay.test.ts
src/components/ExerciseRow.tsx (新建:一行动作名+组次,可展开详情;按衰减默认展开/折叠,可手动切换)
src/components/ExerciseRow.test.tsx
src/pages/TodayPage.tsx     (改:用 ExerciseRow 渲染,传入 count)
src/pages/CheckInPage.tsx   (改:done/部分完成时 incrementCounts(今日计划动作 ids))
src/pages/CheckInPage.test.tsx (新增计数断言)
```

### 任务 3.1:动作库 + 关联(TDD)
- [ ] `exerciseLibrary.test.ts`:库覆盖 planTemplate 里所有 `exerciseId`(遍历断言每个 id 在库中);每条有非空 target/steps/cues/mistakes/asSafety/alternative;安全断言库内无被禁关键字。先红。
- [ ] 起草并实现 `exerciseLibrary.ts`(**先把文案清单给你定稿**);`planTemplate.ts` 每个 main 项补 `exerciseId`。跑绿。commit。

### 任务 3.2:衰减纯函数 + 计数存储(TDD)
- [ ] `decay.test.ts`:`shouldCollapse(4,5)===false`、`shouldCollapse(5,5)===true`。`db`:`incrementCounts(['a','b'])` 后 `getCount('a')===1`;再次 +1 后 ===2;`getAllCounts` 返回映射。先红→实现→绿。commit。

### 任务 3.3:ExerciseRow + 今日页接入(TDD)
- [ ] `ExerciseRow.test.tsx`:count<5 默认展开(详情可见);count≥5 默认折叠(只见名+组次),点标题展开;展开显示 target/steps/cues/mistakes/asSafety/alternative。先红→实现→绿。
- [ ] `TodayPage`:渲染时 `getAllCounts()`,每个动作用 `<ExerciseRow exercise={getExercise(item.exerciseId)} prescription={item.prescription} count={counts[id]??0}/>`。更新 TodayPage 测试。绿。commit。

### 任务 3.4:复盘累计完成次数(TDD)
- [ ] `CheckInPage.test.tsx` 新增:trainingStatus=完成 提交后,今日计划(按今日 type×场景器械)里每个动作的 `getCount` +1;trainingStatus=未做/休息日 不增。先红。
- [ ] `CheckInPage.tsx` 提交逻辑:若 done/partial,解析今日 `dailyPlan`(PR4 前用锚点 type)+ `getScenario(today)?.equipment ?? 'bodyweight'` → 动作 ids → `incrementCounts(ids)`。跑绿。`test`+`build` 绿。commit、推、暂停等合并。

---

# PR4 · 动态计划引擎(§5,测试重中之重)

分支:`feat/v1-engine`(从合并后的 `main`)

## ⚠️ 待确认③:引擎规则测试用例清单(开写前先给你过)

执行 PR4 时,先把下列**测试用例清单**列给你确认,再写实现:

**`classifyBand(checkIn)`(§5.2):**
- 晨僵 gt60 → red;疼痛 6 → red;晨僵 30to60 → yellow;疼痛 4 → yellow;能量 low → yellow;晨僵 lt30+疼痛 2+能量 mid → green;边界:疼痛 5→yellow、6→red;晨僵 lt30→green、30to60→yellow。

**`decideNextType(input)`(§5.3,按序命中即停):**
1. redFlag=true → `rest`(理由「红旗信号 → 休息并就医」)——优先级最高,即使 band=green。
2. band=red → `recovery`(「红档发作期 → 温和恢复日,无负荷」)。
3. band=yellow → `mobility`(「黄档波动期 → 体态/活动度日」)。
4. band=green & 连续训练≥2 → `recovery`(「连续训练 2 天 → 主动恢复」)。
5. band=green & 本周力量≥3 → `mobility`(「本周力量已达 3 次 → 体态/活动度」)。
6. band=green & 其余:lastVariant='A'→`strengthB`,'B'或 null→`strengthA`(「状态稳定 → 力量 X(A/B 轮换)」)。
- 组合用例:redFlag 覆盖 green+力量该练日;green+streak2 即使本周力量 0 也排恢复;green 首次(null)→ strengthA。

**`buildEngineInput(checkIns, dailyPlans, asOfDate)`(从历史装配):**
- 连续训练天数:从昨天往前数,type∈{strengthA,strengthB,mobility} 且当天 checkIn=done/partial 才计,遇 recovery/rest/未做 中断。
- 本周力量次数:近 7 天内 type∈{strengthA,strengthB} 且 done/partial 的天数。
- lastStrengthVariant:最近一条 strengthA/B 的 A/B(无则 null)。

## 引擎接口(纯函数,src/lib/engine.ts)
```ts
export type SymptomBand = 'green' | 'yellow' | 'red'
export interface EngineInput { band: SymptomBand; redFlag: boolean; consecutiveTrainingDays: number; weeklyStrengthCount: number; lastStrengthVariant: 'A' | 'B' | null }
export interface EngineOutput { type: PlanType; reason: string }
export function classifyBand(c: Pick<CheckIn,'stiffness'|'pain'|'energy'>): SymptomBand
export function decideNextType(input: EngineInput): EngineOutput
export function buildEngineInput(checkIns: CheckIn[], dailyPlans: DailyPlan[], asOfDate: string): EngineInput
```

## 数据模型
```ts
export interface DailyPlan { date: string; type: PlanType; reason: string }
```
`dailyPlan` store(keyPath `date`,DB version 升到 4)。

## 接入与替换
- **复盘提交**:写 checkIn 后,`buildEngineInput(...,今天)` + `classifyBand(今天checkIn)` → `decideNextType` → `putDailyPlan({date: 明天, type, reason})`;明日卡显示 type+reason(替换 v0 静态轮换卡)。红旗仍走引擎规则 1(rest)。
- **今日页**:`getDailyPlan(today)`;无则兜底 `{type:'mobility', reason:'暂无昨日复盘 → 默认体态/活动度日'}`。type 不再来自锚点轮换。显示「为什么是今天这个安排」。
- 计数(PR3 任务 3.4)改为读 `getDailyPlan(today).type`。

## 文件结构
```
src/lib/engine.ts / engine.test.ts (新建,测试重中之重)
src/db/index.ts (dailyPlan store v4 + getDailyPlan/putDailyPlan) / index.test.ts
src/pages/CheckInPage.tsx (改:提交跑引擎→存明日 dailyPlan;明日卡显示 reason)
src/pages/CheckInPage.test.tsx (更新:断言明日 dailyPlan 与 reason)
src/pages/TodayPage.tsx (改:读 dailyPlan(today)||兜底;显示 reason)
src/pages/TodayPage.test.tsx (更新)
src/data/planTemplate.ts (TYPE_CYCLE/getTypeForDayIndex 不再被今日页用;保留或标注弃用)
```

### 任务序列(TDD)
- [ ] 4.1 `classifyBand` 全分支+边界测试 → 实现 → commit。
- [ ] 4.2 `decideNextType` 6 规则+红旗优先+组合测试 → 实现 → commit。
- [ ] 4.3 `buildEngineInput`(streak/周次数/lastVariant)测试 → 实现 → commit。
- [ ] 4.4 `dailyPlan` store 往返测试 → 实现 → commit。
- [ ] 4.5 CheckInPage 接引擎(提交存明日 dailyPlan + reason)测试 → 实现 → commit。
- [ ] 4.6 TodayPage 读 dailyPlan + 兜底 + 显示 reason 测试 → 实现 → commit。
- [ ] `test`+`build` 绿。推、暂停等合并。

---

# PR5 · 照片时间线

分支:`feat/v1-photo-timeline`(从合并后的 `main`)

实现 FR5 的时间线 + 两张并排对比,放进展页;不做美颜;**不做拍照半透明轮廓**(留后续)。

## 文件结构
```
src/db/index.ts (改:getAllPhotos()) / index.test.ts
src/pages/ProgressPage.tsx (新建,替换 ProgressPlaceholder)
src/pages/ProgressPage.test.tsx
src/App.tsx (改:progress tab 渲染 ProgressPage)
```

### 任务 5.1:getAllPhotos(TDD)
- [ ] 测试:存 3 张不同 takenAt 的照片,`getAllPhotos()` 返回按 takenAt 升序(或降序)的全部。先红→实现→绿。commit。

### 任务 5.2:ProgressPage(TDD)
- [ ] 测试:渲染时间线(每张显示日期+姿势标签缩略图,用 `URL.createObjectURL`);点两张进入并排对比;无照片显示空态提示。先红→实现→绿。
- [ ] `App.tsx` 用 `ProgressPage` 替换占位。更新 App 测试(进展 tab 出现时间线/空态)。`test`+`build` 绿。commit、推。

---

## 验证(每个 PR)
- `npm run lint`(若纳入)+ `npm run test` 全绿 + `npm run build` 成功;浏览器(preview MCP,端口 5180/4180)冒烟关键路径;`git diff` 复核改动。
- 引擎(PR4):规则分支/边界/组合全覆盖,UI 显示生成理由。
- 离线:动作详情、动作库随构建打包,运行时无网络请求。

## 安全自检(每个 PR 合并前)
- [ ] 新增/改动的训练内容全部出自 §2.5;无大重量深蹲/硬拉/过头推举、无高冲击跑跳、无壶铃摆动、无传统屈曲卷腹。
- [ ] 徒手「拉」用 YTW/superman 后链替代;单侧动作两侧对等。
- [ ] 引擎红旗优先级最高 → rest+就医;晚间体态每天兜底(最低版本)。
- [ ] 拿不准的动作一律更保守。

---
name: release-checklist
description: |
  Use before any git commit, push, merge to main, or deploy/发版/上线/部署 of the 健身大闯关 fitness PWA. Trigger on "提交 / commit / push / 发版 / 上线 / 部署 / deploy / ship / 合并到 main / PR", and after finishing any change set — especially changes touching training content (AS 健康安全), IndexedDB schema, the dynamic plan engine (§5), or the Service Worker / PWA. Apply as a gate, not a suggestion: if any check fails, stop and report — do not ship.
---

# Release Checklist — 发版前 Pre-flight 清单(健身大闯关)

You are the release manager for this single-user, local-first PWA. Every commit/push must pass this gate. Don't skip a step because "it's a small change" — small changes ship the worst bugs.

**Violating the letter of the checklist is violating the spirit of it.** If you're tempted to skip an item, stop and ask why — 99% of the time it's haste.

> 顺序失败即停:任何一步红了就停下报告,不要往下走。

---

## ✓ 0. 健康安全红线(本项目第一优先级,高于一切)

任何改到**训练内容**(动作、组次、计划模板、动作库、引擎产出的类型)的提交,必须先过设计文档 §2 / CLAUDE.md 的 AS 安全约束:

- 无脊柱大重量纵向负荷(大重量深蹲 / 硬拉 / 过头推举)、无高冲击跑跳、无壶铃摆动(swing)、无传统屈曲卷腹 / 仰卧起坐。
- 单侧动作两侧组次对等(顾及侧弯)。徒手「拉」用俯卧后链(YTW / superman)替代。
- 力量日带「锐痛即停」提示;复盘红旗自检命中 → 次日 = 休息 + 就医。
- 拿不准某动作是否安全,一律选更保守方案。

这是本项目的「红线词检查」。`planTemplate.ts` / `exerciseLibrary.ts` / `engine.ts` 的测试里应有安全断言(被禁关键字、对称、锐痛提示)。**改了训练内容却没过安全断言 = 不能提交。**

---

## ✓ 1. Lint / 类型 / 测试 / 构建(本地门禁)

```bash
npm run lint && npm run test && npm run build
```

- `npm run lint` — eslint(CI 也跑,红了不能合)。
- `npm run test` — `vitest run`,全绿,0 failing。**让测试数下降就是回归。**
- `npm run build` — `tsc -b && vite build`(类型检查 + 生产构建)。构建失败必须诊断到根因,不能以"环境问题"放过。

**pre-commit 钩子已强制 test + build**(`.husky/pre-commit`);CI(`ci.yml`)强制 lint + test + build。本地先手动跑一遍能更快定位问题。

---

## ✓ 2. 测试纪律(每次改动都要带测试,先写测试再写实现)

- **每次提交都要有覆盖改动点的测试**——不仅新功能,bug fix / 重构 / UI 调整也要。修 bug 先写一个能复现的失败测试。
- **动态计划引擎(§5)是测试重中之重**:每条规则分支(红旗优先、🔴/🟡/🟢、连续训练上限、A/B 轮换、本周力量次数)、边界、组合都要有单元测试。
- **异步数据用 `findBy*` / `waitFor`,绝不用 `getBy*` 赌时序。** 凡是 IndexedDB 读取后才渲染的元素(`getDailyPlan` / `getScenario` / `getAllCounts` / `getAllPhotos` 等 `useEffect` 异步加载),交互前必须 `await screen.findByText(...)`。`getBy` 本地侥幸过、CI 慢必 flaky。
  - ❌ `fireEvent.click(screen.getByText(/明日计划/))`
  - ✓ `fireEvent.click(await screen.findByText(/明日计划/))`
- **本地全绿 ≠ CI 绿**:时序敏感的 flaky 测试本地几乎必过。判断标准是「这元素是异步出现的吗」,是就必须 `findBy`。
- **工具返回 successful 必须再验证关键改动**:涉及 import / 路由 / store 注册 / 全局配置时,改完再 Grep/Read 确认真的落地了。

---

## ✓ 3. IndexedDB Schema 兼容性

改到 `src/db/index.ts` 或相关类型时:

- [ ] 新增 store 用幂等建表(`if (!db.objectStoreNames.contains(...)) createObjectStore`),并升 `DB_VERSION`。
- [ ] 新增字段一律 **optional**(`field?: T`)——否则老用户进 app 直接 crash。
- [ ] 删字段 / 改结构要能 graceful 处理老数据。
- [ ] **清空 / 迁移已有数据必须先征得用户同意,不要自作主张清数据。**

```ts
// ❌ 新必填字段没默认值 → 老数据 undefined → crash
interface CheckIn { newField: string }
// ✓ 新可选字段
interface CheckIn { newField?: string }
```

---

## ✓ 4. 离线 / PWA 缓存

- 运行时不发起任何网络请求(数据全走 IndexedDB);资源随构建打包。
- 验收:`npm run build && npm run preview` → 断网冷启动,今日 / 复盘 / 进展 / 动作详情可用。
- Service Worker 为 `autoUpdate`。改了 SW / manifest / 大量资源后,提醒用户:手机上拉新版后若仍是旧版,稍候自动更新或「删除主屏图标重新添加」。

---

## ✓ 5. Commit message(一句话,Conventional 风格)

格式:`type: 一句话说明`(`feat` / `fix` / `chore` / `docs` / `test` / `refactor`)。

- ✓ `feat: 动态计划引擎(§5)接入复盘流程,据昨晚症状生成次日类型`
- ✗ 多行 bullet 罗列实现细节

涉及训练内容的提交,在说明里点出已过 AS 安全检查。

---

## ✓ 6. GitHub 流程

- 功能走分支 → PR → CI(lint+test+build)绿 → 合并到 `main`。`main` 始终可构建、测试全绿。
- **推到 `main` 会触发 GitHub Pages 部署**(`deploy.yml`)。合并即上线 `https://phoenixwsl.github.io/fitness-quest/`。
- 一行提交+推送:`git add <具体文件> && git commit -m "type: ..." && git push`(不要 `git add -A` 误带 secrets / 大文件)。

---

## ✓ 7. 必须人工确认的操作(即使前面都过)

- 引入新依赖(`package.json`)。
- IndexedDB `DB_VERSION` 升级 / 删除已有功能 / 清数据。
- 改 PWA manifest(icon / scope / start_url)或 Service Worker 策略。
- 删除测试用例(降低覆盖率 = 回归)。
- 任何触碰 §0 训练安全内容的改动。

---

## ✓ 8. vite/vitest 临时文件卫生

`vite.config.ts` 兼作 vitest 配置,Vite/Vitest 启动会在项目根生成 `vite.config.ts.timestamp-*.mjs` 临时文件;某些沙箱环境删不掉,会堆积。

- 确认 `.gitignore` 覆盖 `*.timestamp-*.mjs`(别污染提交)。
- 少跑全量 `vitest run`——改叶子模块时只跑相关 1–3 个 test 文件;收尾若有残留,在**本地终端**清:
  ```bash
  find . -maxdepth 1 -name 'vite*.config.ts.timestamp-*.mjs' -print -delete
  ```

---

## 反模式(绝对不要做)

- ❌ 改了训练内容不过 §0 AS 安全检查 / 安全断言
- ❌ 跳过 lint / tsc / test / build 因为"小改动"或"很赶"
- ❌ 提交不配测试(bug fix / 重构 / UI 调整也要)
- ❌ 异步出现的元素用 `getBy` 直接交互(CI 必 flaky)
- ❌ 减少测试覆盖率(删测试用例)不告知用户
- ❌ IndexedDB 加必填字段没默认值 / 改 schema 不升 version / 擅自清数据
- ❌ commit message 写多行;`git add -A` 误带无关文件
- ❌ 构建失败以"环境问题"放过,不诊断根因

---

## 红旗 — 出现这些念头就停下

- "这次太小,不用测 / 不用跑 build"
- "本地过了,CI 应该也过"(时序敏感测试本地必过)
- "工具返回 successful,应该改好了"(没再 Grep 验证)
- "先把这个动作加上,安全回头再看"

全都意味着:停,回到对应清单项。

---

> 本 skill 自 `fatboy-quest` 的 release-checklist 提炼而来,按本项目栈(Vitest + RTL + idb / IndexedDB、GitHub Pages、PWA autoUpdate)与第一优先级(AS 健康安全)改写。它是长期纪律,不是建议。

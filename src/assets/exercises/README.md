# 动作示意图(SVG)

每个动作一张简笔示意图,**文件名 = 动作库的 `exerciseId`**,扩展名 `.svg`。
例如 `goblet-squat.svg`、`bird-dog.svg`(id 见 `src/data/exerciseLibrary.ts`)。

- 放进本目录即可,`exerciseDiagrams.ts` 用 `import.meta.glob` 自动收录,随构建打包(离线可用)。
- 缺图自动降级:没有对应 SVG 时,动作详情只显示文字,不报错。
- 由 frank 提供正式图;`goblet-squat.svg` 目前是占位图,替换即可。

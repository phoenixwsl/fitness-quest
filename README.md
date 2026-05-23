# 健身大闯关

一个单用户、本地优先的 PWA,在**强直性脊柱炎安全范围内**督促减脂、改善体态、养成运动与饮食习惯。

> ⚠️ 训练相关内容默认走保守档。健康安全约束见 `CLAUDE.md`,完整设计见 `设计文档.md`。

## 技术栈

React + TypeScript + Vite + Tailwind CSS;PWA(Service Worker,离线可用);IndexedDB 本地存储;无后端、无账号、无云。

## 开发命令

- `npm install` — 安装依赖
- `npm run dev` — 本地开发
- `npm run build` — 生产构建(先类型检查)
- `npm run test` — 单元测试
- `npm run test:watch` — 测试监听模式
- `npm run coverage` — 测试覆盖率
- `npm run lint` — 代码检查

## 文档

- `设计文档.md` — 完整产品 / 训练 / 安全设计
- `CLAUDE.md` — 给 Claude Code 的项目上下文与编码准则

## 状态

v0 开发中。脚手架(Vite + Tailwind + PWA + Vitest + GitHub Actions CI)已就绪。

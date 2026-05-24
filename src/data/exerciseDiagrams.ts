// 动作示意图:自动收录 src/assets/exercises/*.svg(随构建打包,离线可用)。
// 文件名(去扩展名)= 动作库 exerciseId。缺图时返回 undefined,由调用方文字降级。
const modules = import.meta.glob('../assets/exercises/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const BY_ID: Record<string, string> = {}
for (const path in modules) {
  const id = path.split('/').pop()!.replace(/\.svg$/, '')
  BY_ID[id] = modules[path]
}

export function getExerciseDiagram(exerciseId: string): string | undefined {
  return BY_ID[exerciseId]
}

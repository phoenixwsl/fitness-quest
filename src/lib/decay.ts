// 详细度衰减(FR2):累计完成次数达到阈值后,动作详情默认折叠。
export const COLLAPSE_THRESHOLD = 5

export function shouldCollapse(count: number, threshold = COLLAPSE_THRESHOLD): boolean {
  return count >= threshold
}

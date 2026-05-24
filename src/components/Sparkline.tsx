// 手写迷你折线图(纯 SVG,无图表库 → 满足离线 / 不走 CDN)。数据少时短曲线是正常的。
export default function Sparkline({
  points,
  width = 240,
  height = 48,
  ariaLabel,
}: {
  points: number[]
  width?: number
  height?: number
  ariaLabel?: string
}) {
  if (points.length === 0) {
    return <p className="text-xs text-slate-400">暂无数据</p>
  }
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const n = points.length
  const x = (i: number) => (n === 1 ? width / 2 : (i / (n - 1)) * width)
  const y = (v: number) => height - ((v - min) / range) * (height - 4) - 2

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} className="w-full">
      {n === 1 ? (
        <circle cx={x(0)} cy={y(points[0])} r={3} fill="#0d9488" />
      ) : (
        <polyline
          points={points.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
          fill="none"
          stroke="#0d9488"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

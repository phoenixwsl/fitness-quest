// 首次启动展示一次健康须知(设计文档 §2.1),确认后写本地标记,之后不再弹。
export default function HealthNotice({ onAck }: { onAck: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col justify-center gap-4 bg-slate-50 p-6 text-slate-800">
      <h1 className="text-2xl font-bold">健康须知</h1>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-slate-700">
        <p>本工具及其中的训练 / 饮食内容仅供参考,<strong>不构成医疗建议</strong>,也不替代专业诊断与治疗。</p>
        <p>
          鉴于你目前没有专业运动指导,建议<strong>在开始负重训练前,先做一次风湿科或康复科 / 物理治疗师评估</strong>,
          确认可承受的运动类型与强度。在此之前,方案默认走保守档。
        </p>
        <p>
          训练中若出现<strong>红旗信号</strong>——新发剧痛、夜间痛影响睡眠、疼痛或麻木放射到腿、关节肿胀发热伴发烧、
          胸背突发剧痛——请立即停止并尽快就医。
        </p>
        <p className="text-slate-500">强直性脊柱炎训练以维持活动度、温和强化为主,任何动作出现锐痛即停。</p>
      </div>
      <button
        type="button"
        onClick={onAck}
        className="mt-2 rounded-xl bg-teal-600 py-3 text-base font-semibold text-white"
      >
        我已知悉,继续
      </button>
    </div>
  )
}

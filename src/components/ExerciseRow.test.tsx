import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ExerciseRow from './ExerciseRow'
import type { Exercise } from '../types'
import { getExercise } from '../data/exerciseLibrary'

const ex: Exercise = {
  id: 'goblet-squat',
  name: '高脚杯深蹲',
  target: '下肢与核心',
  steps: ['抱重物于胸前', '屈髋下蹲', '站起'],
  cues: ['全脚掌受力'],
  mistakes: ['圆背塌腰'],
  asSafety: '中小重量,锐痛即停',
  alternative: '自重深蹲',
  en: {
    name: 'Goblet Squat',
    target: 'Lower body + core',
    steps: ['Hold the weight at the chest', 'Sit back and down', 'Stand up'],
    cues: ['Whole-foot contact'],
    mistakes: ['Rounding the back'],
    asSafety: 'Light-to-moderate load; stop on sharp pain',
    alternative: 'Bodyweight squat',
  },
}

function renderRow(count: number) {
  render(
    <ul>
      <ExerciseRow exercise={ex} name={ex.name} prescription="3 × 10" count={count} />
    </ul>,
  )
}

describe('ExerciseRow', () => {
  it('新手期(count<5)默认展开详情', () => {
    renderRow(0)
    expect(screen.getByText('下肢与核心')).toBeInTheDocument()
    expect(screen.getByText('屈髋下蹲')).toBeInTheDocument()
  })

  it('熟练后(count≥5)默认折叠,点击动作名展开', () => {
    renderRow(5)
    expect(screen.queryByText('下肢与核心')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('高脚杯深蹲'))
    expect(screen.getByText('下肢与核心')).toBeInTheDocument()
  })

  it('展开后显示各详情字段', () => {
    renderRow(0)
    expect(screen.getByText('全脚掌受力')).toBeInTheDocument()
    expect(screen.getByText('圆背塌腰')).toBeInTheDocument()
    expect(screen.getByText('中小重量,锐痛即停')).toBeInTheDocument()
    expect(screen.getByText('自重深蹲')).toBeInTheDocument()
  })

  it('总是显示动作名与组次', () => {
    renderRow(5)
    expect(screen.getByText('高脚杯深蹲')).toBeInTheDocument()
    expect(screen.getByText('3 × 10')).toBeInTheDocument()
  })

  it('展开后渲染该动作的简笔示意图(alt 含动作名)', () => {
    const real = getExercise('goblet-squat')!
    render(
      <ul>
        <ExerciseRow exercise={real} name={real.name} prescription="3×10" count={0} />
      </ul>,
    )
    expect(screen.getByRole('img', { name: /高脚杯深蹲/ })).toBeInTheDocument()
  })

  it('展开后中英并列:同时出现中文与英文要点', () => {
    const real = getExercise('goblet-squat')!
    render(
      <ul>
        <ExerciseRow exercise={real} name={real.name} prescription="3×10" count={0} />
      </ul>,
    )
    expect(screen.getByText('Goblet Squat')).toBeInTheDocument()
    expect(screen.getByText(/重心落在全脚掌/)).toBeInTheDocument()
    expect(screen.getByText(/Weight on the whole foot/)).toBeInTheDocument()
  })

  it('无匹配示意图时优雅降级:不渲染 img', () => {
    const fake: Exercise = { ...getExercise('goblet-squat')!, id: 'no-such-svg' }
    render(
      <ul>
        <ExerciseRow exercise={fake} name="测试" prescription="1×1" count={0} />
      </ul>,
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})

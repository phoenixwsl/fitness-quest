import { useState } from 'react'
import type { PoseTag } from '../types'

const POSES: { value: PoseTag; label: string }[] = [
  { value: 'front', label: '正面' },
  { value: 'side', label: '侧面' },
  { value: 'back', label: '背面' },
]

export default function PhotoPicker({
  onChange,
}: {
  onChange: (file: File | null, pose: PoseTag) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [pose, setPose] = useState<PoseTag>('front')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setPreviewUrl(f ? URL.createObjectURL(f) : null)
    onChange(f, pose)
  }

  function handlePose(e: React.ChangeEvent<HTMLSelectElement>) {
    const p = e.target.value as PoseTag
    setPose(p)
    onChange(file, p)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <label htmlFor="photo-pose" className="text-sm text-slate-600">
          姿势
        </label>
        <select
          id="photo-pose"
          aria-label="姿势"
          value={pose}
          onChange={handlePose}
          className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
        >
          {POSES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <label
        htmlFor="photo-input"
        className="inline-block w-fit cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700"
      >
        选择或拍摄照片
      </label>
      <input
        id="photo-input"
        aria-label="选择或拍摄照片"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      {previewUrl && (
        <img
          src={previewUrl}
          alt="照片预览"
          className="mt-1 h-28 w-28 rounded-lg object-cover"
        />
      )}
    </div>
  )
}

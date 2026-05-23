import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PhotoPicker from './PhotoPicker'

function selectFile() {
  const input = screen.getByLabelText('选择或拍摄照片') as HTMLInputElement
  const file = new File(['x'], 'pose.jpg', { type: 'image/jpeg' })
  fireEvent.change(input, { target: { files: [file] } })
  return file
}

describe('PhotoPicker', () => {
  it('选择文件后显示缩略图预览', () => {
    render(<PhotoPicker onChange={vi.fn()} />)
    expect(screen.queryByAltText('照片预览')).not.toBeInTheDocument()
    selectFile()
    expect(screen.getByAltText('照片预览')).toBeInTheDocument()
  })

  it('选择文件时回调上抛 file 与默认姿势', () => {
    const onChange = vi.fn()
    render(<PhotoPicker onChange={onChange} />)
    const file = selectFile()
    expect(onChange).toHaveBeenCalledWith(file, 'front')
  })

  it('改变姿势时带着已选文件回调', () => {
    const onChange = vi.fn()
    render(<PhotoPicker onChange={onChange} />)
    const file = selectFile()
    fireEvent.change(screen.getByLabelText('姿势'), { target: { value: 'side' } })
    expect(onChange).toHaveBeenLastCalledWith(file, 'side')
  })
})

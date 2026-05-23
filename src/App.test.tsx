import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('显示项目名称', () => {
    render(<App />)
    expect(screen.getByText('健身大闯关')).toBeInTheDocument()
  })
})

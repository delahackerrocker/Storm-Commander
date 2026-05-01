import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('Chess-ish prototype', () => {
  it('renders the playable shell', () => {
    render(<App />)

    expect(screen.getByText('White to move')).toBeInTheDocument()
    expect(screen.getAllByTestId('chess-square')).toHaveLength(64)
    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument()
  })
})

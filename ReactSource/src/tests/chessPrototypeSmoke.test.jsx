import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('Chess-ish prototype', () => {
  it('starts on the menu and opens basic chess', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(
      screen.getByRole('button', { name: /^basic chess$/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^second page$/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^basic chess$/i }))

    expect(screen.getByText('White to move')).toBeInTheDocument()
    expect(screen.getAllByTestId('chess-square')).toHaveLength(64)
    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^back$/i })).toBeInTheDocument()
  })

  it('navigates to the second page and back to the start menu', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^second page$/i }))

    expect(screen.getByLabelText('Second page')).toBeInTheDocument()
    expect(screen.queryByTestId('chess-square')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^back$/i }))

    expect(
      screen.getByRole('button', { name: /^basic chess$/i }),
    ).toBeInTheDocument()
  })
})

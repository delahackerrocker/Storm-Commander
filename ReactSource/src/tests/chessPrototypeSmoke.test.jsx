import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'

async function openStartMenuPage(user, pageName) {
  await user.click(screen.getByRole('button', { name: pageName }))
}

describe('Chess-ish prototype', () => {
  it('starts at a Start Menu with all playable modes', () => {
    render(<App />)

    expect(screen.getByRole('main', { name: /^Start menu$/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^Storm Commander$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Random Encounter$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Storm Chess Drill$/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Basic Chess$/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Debug$/ })).not.toBeInTheDocument()
  })

  it('opens random encounter from the Start Menu without showing the Debug menu', async () => {
    const user = userEvent.setup()
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    try {
      render(<App />)

      await openStartMenuPage(user, /^Random Encounter$/)

      expect(screen.getByRole('heading', { name: /^Random Pirate Raid$/ })).toBeInTheDocument()
      expect(screen.getByText('Storm Commander Alpha')).toBeInTheDocument()
      expect(screen.getAllByTestId('storm-encounter-square').length).toBeGreaterThan(0)
      expect(screen.queryByRole('button', { name: /^Debug$/ })).not.toBeInTheDocument()
    } finally {
      randomSpy.mockRestore()
    }
  })

  it('opens basic chess from the Start Menu and returns to the Start Menu', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await openStartMenuPage(user, /^Basic Chess$/)

    expect(screen.getByText('White to move')).toBeInTheDocument()
    expect(screen.getAllByTestId('chess-square')).toHaveLength(64)
    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^back$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Debug$/ })).not.toBeInTheDocument()
    expect(container.querySelector('.storm-debug-chess-root')).toBeInTheDocument()
    expect(container.querySelector('.standard-chess-root')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^back$/i }))

    expect(screen.getByRole('main', { name: /^Start menu$/ })).toBeInTheDocument()
  })

  it('opens the Storm Commander chess drill from the Start Menu and hides Debug', async () => {
    const user = userEvent.setup()

    render(<App />)

    await openStartMenuPage(user, /^Storm Chess Drill$/)

    expect(screen.getByText('Storm Commander')).toBeInTheDocument()
    expect(screen.getAllByTestId('chess-square')).toHaveLength(64)
    expect(screen.queryByRole('button', { name: /^Debug$/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^back$/i }))

    expect(screen.getByRole('main', { name: /^Start menu$/ })).toBeInTheDocument()
  })
})

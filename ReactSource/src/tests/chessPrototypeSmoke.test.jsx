import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'

async function openDebugPage(user, pageName) {
  const debugButton = screen.getByRole('button', { name: /^Debug$/ })
  for (let press = 0; press < 6; press += 1) {
    await user.click(debugButton)
  }
  await user.click(screen.getByRole('button', { name: pageName }))
}

describe('Chess-ish prototype', () => {
  it('starts in Storm Commander random encounter mode', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /^Random Pirate Raid$/ })).toBeInTheDocument()
    expect(screen.getByText('Storm Commander Alpha')).toBeInTheDocument()
    expect(screen.getAllByTestId('storm-encounter-square').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: /^basic chess$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Storm Commander$/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Debug$/ })).toBeInTheDocument()
  })

  it('fades and unlocks the debug menu after six presses', () => {
    vi.useFakeTimers()

    try {
      render(<App />)

      const debugButton = screen.getByRole('button', { name: /^Debug$/ })

      expect(debugButton).toHaveStyle({ opacity: '1' })

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(debugButton).toHaveStyle({ opacity: '0' })

      for (let press = 0; press < 5; press += 1) {
        fireEvent.click(debugButton)
      }

      expect(debugButton).toHaveStyle({ opacity: '1' })
      expect(screen.queryByRole('button', { name: /^Basic Chess$/ })).not.toBeInTheDocument()

      fireEvent.click(debugButton)

      expect(screen.getByRole('button', { name: /^Basic Chess$/ })).toBeInTheDocument()
      expect(debugButton).toHaveStyle({ opacity: '1' })

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(debugButton).toHaveStyle({ opacity: '0' })
    } finally {
      vi.useRealTimers()
    }
  })

  it('opens basic chess only through debug mode', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await openDebugPage(user, /^Basic Chess$/)

    expect(screen.getByText('White to move')).toBeInTheDocument()
    expect(screen.getAllByTestId('chess-square')).toHaveLength(64)
    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^back$/i })).toBeInTheDocument()
    expect(container.querySelector('.storm-debug-chess-root')).toBeInTheDocument()
    expect(container.querySelector('.standard-chess-root')).not.toBeInTheDocument()
  })

  it('opens the Storm Commander chess drill only through debug mode', async () => {
    const user = userEvent.setup()

    render(<App />)

    await openDebugPage(user, /^Storm Chess Drill$/)

    expect(screen.getByText('Storm Commander')).toBeInTheDocument()
    expect(screen.getAllByTestId('chess-square')).toHaveLength(64)

    await user.click(screen.getByRole('button', { name: /^back$/i }))

    expect(screen.getByRole('heading', { name: /^Random Pirate Raid$/ })).toBeInTheDocument()
  })
})

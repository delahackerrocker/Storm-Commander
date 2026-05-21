import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'

async function openDebugPage(user, pageName) {
  await user.click(screen.getByRole('button', { name: /^Debug$/ }))
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

  it('opens basic chess only through debug mode', async () => {
    const user = userEvent.setup()

    render(<App />)

    await openDebugPage(user, /^Basic Chess$/)

    expect(screen.getByText('White to move')).toBeInTheDocument()
    expect(screen.getAllByTestId('chess-square')).toHaveLength(64)
    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^back$/i })).toBeInTheDocument()
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

import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('separate variant style sources', () => {
  it('renders Standard Chess inside the standard style root only', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await user.click(screen.getByRole('button', { name: /^basic chess$/i }))

    expect(container.querySelector('.standard-chess-root')).toBeInTheDocument()
    expect(container.querySelector('.storm-commander-root')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders Storm Commander inside the storm style root only', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await user.click(screen.getByRole('button', { name: /^Storm Commander$/ }))

    expect(container.querySelector('.storm-commander-root')).toBeInTheDocument()
    expect(container.querySelector('.standard-chess-root')).not.toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(32)
  })

  it('keeps chess-specific selectors out of the global shell stylesheet', () => {
    const globalStyles = readFileSync('src/styles.css', 'utf8')

    expect(globalStyles).not.toMatch(/\.chess-board/)
    expect(globalStyles).not.toMatch(/\.chess-square/)
    expect(globalStyles).not.toMatch(/\.chess-piece/)
    expect(globalStyles).not.toMatch(/\.game-status/)
    expect(globalStyles).not.toMatch(/\.scenario-panel/)
    expect(globalStyles).not.toMatch(/\.move-history/)
  })
})

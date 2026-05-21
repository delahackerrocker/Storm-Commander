import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'

async function openDebugPage(user, pageName) {
  await user.click(screen.getByRole('button', { name: /^Debug$/ }))
  await user.click(screen.getByRole('button', { name: pageName }))
}

describe('separate variant style sources', () => {
  it('renders Standard Chess inside the standard style root only', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await openDebugPage(user, /^Basic Chess$/)

    expect(container.querySelector('.standard-chess-root')).toBeInTheDocument()
    expect(container.querySelector('.storm-commander-root')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders Storm Commander inside the storm style root only', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await openDebugPage(user, /^Storm Chess Drill$/)

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

  it('keeps the random encounter status panel below a centered board column', () => {
    const stormStyles = readFileSync('src/styles/stormCommander.css', 'utf8')
    const topbarRule = stormStyles.match(
      /\.storm-commander-root\.storm-encounter-root > \.storm-encounter-topbar\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const shellRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-shell\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const panelRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-panel\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const iconButtonRule = stormStyles.match(
      /\.storm-commander-root\.storm-encounter-root \.storm-icon-button\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const diceIconRule = stormStyles.match(
      /\.storm-commander-root \.storm-dice-icon\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const dicePipRule = stormStyles.match(
      /\.storm-commander-root \.storm-dice-pip\s*\{(?<body>[^}]+)\}/,
    )?.groups.body

    expect(topbarRule).toContain('width: min(760px, calc(100vw - 32px));')
    expect(shellRule).toContain('grid-template-columns: minmax(320px, 760px);')
    expect(shellRule).toContain('justify-content: center;')
    expect(panelRule).toContain('grid-column: 1;')
    expect(iconButtonRule).toContain('width: 40px;')
    expect(iconButtonRule).toContain('height: 40px;')
    expect(iconButtonRule).toContain('min-width: 40px;')
    expect(iconButtonRule).toContain('min-height: 40px;')
    expect(diceIconRule).toContain('border: 1px solid currentColor;')
    expect(dicePipRule).toContain('width: 2px;')
    expect(dicePipRule).toContain('height: 2px;')
  })
})

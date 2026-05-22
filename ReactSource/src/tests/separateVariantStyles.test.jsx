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

  it('keeps random encounter comms around a centered board column', () => {
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
    const playerCommsRule = stormStyles.match(
      /\.storm-commander-root \.storm-comms-window-player\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const opponentCommsRule = stormStyles.match(
      /\.storm-commander-root \.storm-comms-window-opponent\s*\{(?<body>[^}]+)\}/,
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
    const movementRule = stormStyles.match(
      /\.storm-commander-root \.storm-movement-pattern\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const transmissionRule = stormStyles.match(
      /\.storm-commander-root \.storm-comms-transmission\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const barkRule = stormStyles.match(
      /\.storm-commander-root \.storm-comms-bark\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const missionOverlayRule = stormStyles.match(
      /\.storm-commander-root \.storm-mission-overlay\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const missionDialogRule = stormStyles.match(
      /\.storm-commander-root \.storm-mission-dialog\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const resultOverlayRule = stormStyles.match(
      /\.storm-commander-root \.storm-result-overlay\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const resultDialogRule = stormStyles.match(
      /\.storm-commander-root \.storm-result-dialog\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const selectionRingRule = stormStyles.match(
      /\.storm-commander-root \.storm-selection-ring\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const activeSelectionRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square\.is-selected \.storm-selection-ring\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const legalMoveRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square\.is-legal-move::after\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const captureRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square\.is-capture::after\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const encounterPieceRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-piece\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const movementMoveCellRule = stormStyles.match(
      /\.storm-commander-root \.storm-movement-pattern-cell\.is-move\s*\{(?<body>[^}]+)\}/,
    )?.groups.body

    expect(topbarRule).toContain('width: min(760px, calc(100vw - 32px));')
    expect(topbarRule).toContain('flex-wrap: nowrap;')
    expect(shellRule).toContain(
      'grid-template-columns: minmax(180px, 250px) minmax(320px, 760px) minmax(180px, 250px);',
    )
    expect(shellRule).toContain('"player-comms board opponent-comms"')
    expect(shellRule).toContain('". encounter-status ."')
    expect(shellRule).toContain('justify-content: center;')
    expect(panelRule).toContain('grid-area: encounter-status;')
    expect(playerCommsRule).toContain('grid-area: player-comms;')
    expect(opponentCommsRule).toContain('grid-area: opponent-comms;')
    expect(stormStyles).toContain('.storm-commander-root .storm-mission-summary-row')
    expect(stormStyles).toContain('grid-template-columns: max-content minmax(0, 1fr);')
    expect(stormStyles).toContain('.storm-commander-root .storm-mission-summary-button')
    expect(stormStyles).toContain('min-width: 104px;')
    expect(stormStyles).toContain(
      '.storm-commander-root .storm-mission-summary-row .storm-mission-summary-grid',
    )
    expect(stormStyles).toContain('@media (max-width: 560px)')
    expect(stormStyles).toContain('gap: 8px;')
    expect(stormStyles).toContain('width: 36px;')
    expect(iconButtonRule).toContain('width: 40px;')
    expect(iconButtonRule).toContain('height: 40px;')
    expect(iconButtonRule).toContain('min-width: 40px;')
    expect(iconButtonRule).toContain('min-height: 40px;')
    expect(diceIconRule).toContain('border: 1px solid currentColor;')
    expect(dicePipRule).toContain('width: 2px;')
    expect(dicePipRule).toContain('height: 2px;')
    expect(stormStyles).not.toContain('.storm-commander-root .storm-comms-movement')
    expect(transmissionRule).toContain('grid-template-columns: 85px minmax(0, 1fr);')
    expect(stormStyles).toContain('grid-template-columns: 85px minmax(130px, 1fr) 85px;')
    expect(stormStyles).toContain('grid-template-areas: "portrait title movement";')
    expect(stormStyles).toContain('grid-area: portrait;')
    expect(stormStyles).toContain('font-size: 1.55rem;')
    expect(stormStyles).toContain('display: contents;')
    expect(stormStyles).toContain('grid-template-columns: 85px max-content 85px;')
    expect(stormStyles).toContain('width: max-content;')
    expect(stormStyles).toContain('overflow-x: visible;')
    expect(stormStyles).toContain('font-size: 1.28rem;')
    expect(stormStyles).toContain('display: none;')
    expect(missionOverlayRule).toContain('place-items: stretch;')
    expect(missionOverlayRule).toContain('padding: 0;')
    expect(missionOverlayRule).toContain('overflow: hidden;')
    expect(missionDialogRule).toContain('box-sizing: border-box;')
    expect(missionDialogRule).toContain('width: 100vw;')
    expect(missionDialogRule).toContain('height: 100dvh;')
    expect(missionDialogRule).toContain('max-height: none;')
    expect(missionDialogRule).toContain('border-radius: 0;')
    expect(resultOverlayRule).toContain('z-index: 70;')
    expect(resultOverlayRule).toContain('place-items: center;')
    expect(resultDialogRule).toContain('width: min(520px, calc(100vw - 32px));')
    expect(resultDialogRule).toContain('border-radius: var(--radius);')
    expect(stormStyles).toContain('.storm-commander-root .storm-result-dialog.is-success')
    expect(stormStyles).toContain('.storm-commander-root .storm-result-dialog.is-failure')
    expect(stormStyles).toContain('.storm-commander-root .storm-result-action')
    expect(movementRule).toContain('justify-self: center;')
    expect(movementRule).toContain('align-self: center;')
    expect(movementRule).toContain('grid-template-columns: repeat(5, 11px);')
    expect(movementRule).toContain('background-size: 14px 14px;')
    expect(barkRule).toContain('min-height: 85px;')
    expect(selectionRingRule).toContain('border-radius: 50%;')
    expect(selectionRingRule).toContain('z-index: 2;')
    expect(activeSelectionRule).toContain('border: 5px solid var(--selected);')
    expect(legalMoveRule).toContain('z-index: 2;')
    expect(legalMoveRule).toContain('width: 20%;')
    expect(legalMoveRule).toContain('height: 20%;')
    expect(captureRule).toContain('border: 5px solid var(--storm-turn-hint);')
    expect(captureRule).toContain('border-radius: 50%;')
    expect(captureRule).toContain('linear-gradient(')
    expect(captureRule).toContain('45deg')
    expect(captureRule).toContain('-45deg')
    expect(captureRule).toContain('box-shadow: none;')
    expect(encounterPieceRule).toContain('z-index: 3;')
    expect(movementMoveCellRule).toContain('background: var(--storm-pirate-orange);')
  })
})

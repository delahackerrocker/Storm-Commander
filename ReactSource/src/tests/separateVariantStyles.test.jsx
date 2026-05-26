import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'

async function openDebugPage(user, pageName) {
  const debugButton = screen.getByRole('button', { name: /^Debug$/ })
  for (let press = 0; press < 6; press += 1) {
    await user.click(debugButton)
  }
  await user.click(screen.getByRole('button', { name: pageName }))
}

describe('separate variant style sources', () => {
  it('renders Basic Chess inside the Storm debug chess style root', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await openDebugPage(user, /^Basic Chess$/)

    expect(container.querySelector('.storm-commander-root')).toBeInTheDocument()
    expect(container.querySelector('.storm-debug-chess-root')).toBeInTheDocument()
    expect(container.querySelector('.standard-chess-root')).not.toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(32)
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
    const shellRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-shell\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const encounterRootRule = stormStyles.match(
      /\.storm-commander-root\.storm-encounter-root\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const encounterBoardRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-board\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const panelRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-panel\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const commsWindowRule = stormStyles.match(
      /\.storm-commander-root \.storm-comms-window\s*\{(?<body>[^}]+)\}/,
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
    const missionStatusButtonRule = stormStyles.match(
      /\.storm-commander-root \.storm-mission-status-button\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const missionStatusButtonFocusRule = stormStyles.match(
      /\.storm-commander-root \.storm-mission-status-button:hover,\s*\n\.storm-commander-root \.storm-mission-status-button:focus-visible\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const stackedMediaRule = stormStyles.match(
      /@media \(max-width: 1180px\)\s*\{(?<body>[\s\S]+?)\n\}/,
    )?.groups.body
    const normalizedStackedMediaRule = stackedMediaRule?.replace(/\r\n/g, '\n')
    const verticalMediaRule = stormStyles.match(
      /@media \(max-width: 900px\)\s*\{(?<body>[\s\S]+?)\n\}/,
    )?.groups.body
    const phoneMediaRule = stormStyles.match(
      /@media \(max-width: 560px\)\s*\{(?<body>[\s\S]+?)\n\}/,
    )?.groups.body
    const movementRule = stormStyles.match(
      /\.storm-commander-root \.storm-movement-pattern\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const portraitRule = stormStyles.match(
      /\.storm-commander-root \.storm-comms-portrait\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const portraitShipRule = stormStyles.match(
      /\.storm-commander-root \.storm-comms-portrait \.storm-ship-piece\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const transmissionRule = stormStyles.match(
      /\.storm-commander-root \.storm-comms-transmission\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const barkRule = stormStyles.match(
      /\.storm-commander-root \.storm-comms-bark\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const commsTitleRule = [...stormStyles.matchAll(
      /\.storm-commander-root \.storm-comms-window h2\s*\{(?<body>[^}]+)\}/g,
    )].map((match) => match.groups.body)
      .find((body) => body.includes('font-size: 1.04rem;'))
    const stackedCommsTitleRule = [...stormStyles.matchAll(
      /\.storm-commander-root \.storm-comms-window h2\s*\{(?<body>[^}]+)\}/g,
    )].map((match) => match.groups.body)
      .find((body) => body.includes('font-size: 2rem;'))
    const missionOverlayRule = stormStyles.match(
      /\.storm-commander-root \.storm-mission-overlay\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const missionDialogRule = stormStyles.match(
      /\.storm-commander-root \.storm-mission-dialog\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const missionDismissRule = stormStyles.match(
      /\.storm-commander-root \.storm-mission-dismiss\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const objectivePanelRule = stormStyles.match(
      /\.storm-commander-root \.storm-objective-panel\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const objectiveTargetIconRule = stormStyles.match(
      /\.storm-commander-root \.storm-objective-target-icon\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const objectiveTargetShipIconRule = stormStyles.match(
      /\.storm-commander-root \.storm-objective-target-icon\.is-target\s*\{(?<body>[^}]+)\}/,
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
    const selectionFlashRule = stormStyles.match(
      /\.storm-commander-root \.storm-selection-flash\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const playerSoftSelectionRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square\.is-player-soft-selected \.storm-selection-ring\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const opponentSoftSelectionRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square\.is-opponent-soft-selected \.storm-selection-ring\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const activeSelectionRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square\.is-selected \.storm-selection-ring\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const lastMoveFromRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square\.is-last-move-from::before\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const legalMoveRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square\.is-legal-move::after\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const encounterLightSquareRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square\.is-light\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const captureRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square\.is-capture::after\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const captureLaserRule = stormStyles.match(
      /\.storm-commander-root \.storm-capture-laser\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const extractionSquareRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square\.is-extraction::before\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const targetSquareRule = [...stormStyles.matchAll(
      /\.storm-commander-root \.storm-encounter-square\.is-target::before\s*\{(?<body>[^}]+)\}/g,
    )].map((match) => match.groups.body)
      .find((body) => body.includes('z-index: 2;'))
    const encounterPieceRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-piece\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const boardShipRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square \.storm-ship-piece\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const movementMoveCellRule = stormStyles.match(
      /\.storm-commander-root \.storm-movement-pattern-cell\.is-move\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const movementCaptureHintRule = stormStyles.match(
      /\.storm-commander-root \.storm-movement-pattern-cell\.is-capture-hint\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const verticalBreakpointIndex = stormStyles.indexOf('@media (max-width: 900px)')
    const phoneBreakpointIndex = stormStyles.indexOf('@media (max-width: 560px)')
    const compactCommsIndex = stormStyles.indexOf(
      'grid-template-columns: 43px 43px minmax(0, 1fr);',
    )

    expect(stormStyles).not.toContain('storm-encounter-topbar')
    expect(stormStyles).not.toContain('storm-encounter-brand')
    expect(stormStyles).not.toContain('storm-encounter-actions')
    expect(encounterRootRule).toContain(
      'radial-gradient(circle at 0% 0%, var(--storm-opponent-faction-bg), transparent 42%)',
    )
    expect(encounterRootRule).toContain(
      'radial-gradient(circle at 100% 100%, var(--storm-player-faction-bg), transparent 44%)',
    )
    expect(encounterRootRule).toContain(
      'radial-gradient(circle at 86% 8%, rgba(89, 30, 58, 0.42), transparent 32%)',
    )
    expect(shellRule).toContain(
      'grid-template-columns: minmax(180px, 250px) minmax(320px, 760px) minmax(180px, 250px);',
    )
    expect(shellRule).toContain('"opponent-comms board player-comms"')
    expect(shellRule).not.toContain('encounter-status')
    expect(shellRule).toContain('width: min(1320px, calc(100vw - 32px));')
    expect(shellRule).toContain('justify-content: center;')
    expect(encounterBoardRule).toContain('border: 4px solid var(--storm-turn-hint);')
    expect(panelRule).toContain('position: fixed;')
    expect(panelRule).toContain('left: 16px;')
    expect(panelRule).toContain('bottom: 16px;')
    expect(panelRule).toContain('z-index: 30;')
    expect(missionStatusButtonRule).toContain('width: 48px;')
    expect(missionStatusButtonRule).toContain('height: 48px;')
    expect(missionStatusButtonRule).toContain('border-radius: var(--radius);')
    expect(missionStatusButtonRule).toContain('background: rgba(115, 221, 126, 0.9);')
    expect(missionStatusButtonRule).toContain('box-shadow: 0 8px 22px rgba(115, 221, 126, 0.18);')
    expect(missionStatusButtonFocusRule).toContain('outline: 3px solid rgba(115, 221, 126, 0.5);')
    expect(commsWindowRule).toContain('box-sizing: border-box;')
    expect(commsWindowRule).toContain('position: relative;')
    expect(commsWindowRule).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));')
    expect(commsWindowRule).toContain('grid-template-areas:')
    expect(commsWindowRule).toContain('"portrait movement"')
    expect(commsWindowRule).toContain('"title title";')
    expect(commsWindowRule).toContain('justify-self: stretch;')
    expect(commsWindowRule).toContain('width: 100%;')
    expect(commsWindowRule).toContain('border: 2px solid var(--storm-comms-faction-color')
    expect(commsWindowRule).toContain('0 0 18px var(--storm-comms-faction-glow')
    expect(playerCommsRule).toContain('grid-area: player-comms;')
    expect(opponentCommsRule).toContain('grid-area: opponent-comms;')
    expect(stormStyles).not.toContain('.storm-commander-root .storm-mission-summary-row')
    expect(stormStyles).not.toContain('.storm-commander-root .storm-mission-summary-button')
    expect(stormStyles).not.toContain('storm-mission-summary-new-encounter')
    expect(stackedMediaRule).toContain('.storm-commander-root .storm-encounter-shell')
    expect(normalizedStackedMediaRule).toContain(
      [
        'grid-template-areas:',
        '      "opponent-comms"',
        '      "board"',
        '      "player-comms";',
      ].join('\n'),
    )
    expect(stackedMediaRule).toContain(
      '.storm-commander-root .storm-comms-window-player',
    )
    expect(stackedMediaRule).toContain('grid-template-areas: "title movement portrait";')
    expect(stackedMediaRule).toContain('text-align: right;')
    expect(stormStyles).toContain('@media (max-width: 560px)')
    expect(stormStyles).toContain('gap: 8px;')
    expect(stormStyles).toContain('width: 36px;')
    expect(verticalMediaRule).not.toContain('"player-comms"')
    expect(phoneMediaRule).toContain('.storm-commander-root .storm-mission-status-button')
    expect(phoneMediaRule).toContain('width: 44px;')
    expect(phoneMediaRule).toContain('height: 44px;')
    expect(iconButtonRule).toContain('width: 40px;')
    expect(iconButtonRule).toContain('height: 40px;')
    expect(iconButtonRule).toContain('min-width: 40px;')
    expect(iconButtonRule).toContain('min-height: 40px;')
    expect(diceIconRule).toContain('border: 1px solid currentColor;')
    expect(dicePipRule).toContain('width: 2px;')
    expect(dicePipRule).toContain('height: 2px;')
    expect(stormStyles).not.toContain('.storm-commander-root .storm-comms-movement')
    expect(transmissionRule).toContain('display: contents;')
    expect(portraitRule).toContain('grid-area: portrait;')
    expect(portraitRule).toContain('width: 100%;')
    expect(movementRule).toContain('grid-area: movement;')
    expect(movementRule).toContain('width: 100%;')
    expect(movementRule).toContain('aspect-ratio: 1;')
    expect(barkRule).toContain('display: none;')
    expect(stormStyles).toContain('grid-template-columns: 85px 85px minmax(130px, 1fr);')
    expect(stormStyles).toContain('grid-template-areas: "portrait movement title";')
    expect(stormStyles).toContain('grid-area: portrait;')
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-window[data-faction='pirate']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-window[data-faction='imperial']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-window[data-faction='robocorp']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-window[data-faction='rebel']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-portrait[data-faction='pirate']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-portrait[data-faction='imperial']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-portrait[data-faction='robocorp']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-portrait[data-faction='rebel']")
    expect(stormStyles).toContain('border-color: rgba(232, 108, 36, 0.82);')
    expect(stormStyles).toContain('border-color: rgba(213, 166, 14, 0.86);')
    expect(stormStyles).toContain('border-color: rgba(85, 170, 242, 0.82);')
    expect(stormStyles).toContain('border-color: rgba(154, 112, 212, 0.86);')
    expect(stormStyles).toContain('--storm-comms-faction-color: rgba(232, 108, 36, 0.82);')
    expect(stormStyles).toContain('--storm-comms-faction-color: rgba(213, 166, 14, 0.86);')
    expect(stormStyles).toContain('--storm-comms-faction-color: rgba(85, 170, 242, 0.82);')
    expect(stormStyles).toContain('--storm-comms-faction-color: rgba(154, 112, 212, 0.86);')
    expect(stormStyles).toContain('--storm-comms-title-color: #e86c24;')
    expect(stormStyles).toContain('--storm-comms-title-color: #d5a60e;')
    expect(stormStyles).toContain('--storm-comms-title-color: #55aaf2;')
    expect(stormStyles).toContain('--storm-comms-title-color: #9a70d4;')
    expect(stormStyles).toContain(".storm-commander-root .storm-mission-faction-name[data-faction='pirate']")
    expect(stormStyles).toContain(".storm-commander-root .storm-mission-faction-name[data-faction='imperial']")
    expect(stormStyles).toContain(".storm-commander-root .storm-mission-faction-name[data-faction='robocorp']")
    expect(stormStyles).toContain(".storm-commander-root .storm-mission-faction-name[data-faction='rebel']")
    expect(stormStyles).toContain(".storm-commander-root .storm-mission-ai-type[data-faction='pirate']")
    expect(stormStyles).toContain(".storm-commander-root .storm-mission-ai-type[data-faction='imperial']")
    expect(stormStyles).toContain(".storm-commander-root .storm-mission-ai-type[data-faction='robocorp']")
    expect(stormStyles).toContain(".storm-commander-root .storm-mission-ai-type[data-faction='rebel']")
    expect(commsTitleRule).toContain('color: var(--storm-comms-title-color')
    expect(stackedCommsTitleRule).toContain('font-size: 2rem;')
    expect(stormStyles).toContain('display: contents;')
    expect(stormStyles).toContain('grid-template-columns: 43px 43px minmax(0, 1fr);')
    expect(compactCommsIndex).toBeGreaterThan(verticalBreakpointIndex)
    expect(compactCommsIndex).toBeLessThan(phoneBreakpointIndex)
    expect(stormStyles).toContain('width: 43px;')
    expect(stormStyles).toContain('height: 43px;')
    expect(stormStyles).toContain('grid-template-columns: repeat(5, 5.5px);')
    expect(stormStyles).toContain('grid-template-rows: repeat(5, 5.5px);')
    expect(stormStyles).toContain('width: 5.5px;')
    expect(stormStyles).toContain('height: 5.5px;')
    expect(stormStyles).not.toContain('width: max-content;')
    expect(stormStyles).toContain('font-size: 1.28rem;')
    expect(stormStyles).toContain('display: none;')
    expect(missionOverlayRule).toContain('place-items: center;')
    expect(missionOverlayRule).toContain('padding: 24px;')
    expect(missionOverlayRule).toContain('background: rgba(0, 0, 0, 0.5);')
    expect(missionDialogRule).toContain('box-sizing: border-box;')
    expect(missionDialogRule).toContain('width: min(760px, calc(100vw - 32px));')
    expect(missionDialogRule).toContain('max-height: calc(100dvh - 48px);')
    expect(missionDialogRule).toContain('align-content: center;')
    expect(missionDialogRule).toContain('border-radius: var(--radius);')
    expect(stormStyles).toContain('padding: 22px;')
    expect(stormStyles).not.toContain('padding: 76px 18px 22px;')
    expect(stormStyles).not.toContain('storm-mission-return-note')
    expect(missionDismissRule).not.toContain('position: absolute;')
    expect(missionDismissRule).toContain('justify-self: start;')
    expect(objectivePanelRule).toBeDefined()
    expect(objectivePanelRule).toContain('grid-template-columns: minmax(0, 1fr) auto;')
    expect(objectivePanelRule).toContain('align-items: center;')
    expect(objectiveTargetIconRule).toBeDefined()
    expect(objectiveTargetIconRule).toContain('justify-self: end;')
    expect(objectiveTargetIconRule).toContain('width: 86px;')
    expect(stormStyles).toContain('.storm-commander-root .storm-objective-target-icon.is-extraction')
    expect(stormStyles).toContain('.storm-commander-root .storm-objective-target-icon.is-target')
    expect(objectiveTargetShipIconRule).toContain('border: 2px dashed rgba(115, 221, 126, 0.9);')
    expect(objectiveTargetShipIconRule).toContain('box-shadow: 0 0 16px rgba(115, 221, 126, 0.18);')
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
    expect(movementRule).toContain('border: 2px solid var(--storm-comms-faction-color')
    expect(movementRule).toContain('background: rgba(7, 2, 12, 0.62);')
    expect(movementRule).not.toContain('linear-gradient')
    expect(movementRule).not.toContain('background-size')
    expect(stormStyles).not.toContain('background-size: 7px 7px;')
    expect(portraitRule).toContain('position: relative;')
    expect(portraitShipRule).toContain('width: 112.32%;')
    expect(portraitShipRule).toContain('height: 112.32%;')
    expect(portraitShipRule).toContain('position: absolute;')
    expect(portraitShipRule).toContain('top: 50%;')
    expect(portraitShipRule).toContain('left: 50%;')
    expect(portraitShipRule).toContain('translate: -50% -50%;')
    expect(barkRule).toContain('min-height: 85px;')
    expect(selectionRingRule).not.toContain('border-radius: 50%;')
    expect(selectionRingRule).toContain('z-index: 2;')
    expect(selectionFlashRule).toContain('position: absolute;')
    expect(selectionFlashRule).toContain('background: var(--storm-selection-flash-color);')
    expect(selectionFlashRule).toContain('animation: storm-selection-flash 0.3s ease-out forwards;')
    expect(selectionFlashRule).not.toContain('position: fixed;')
    expect(playerSoftSelectionRule).toContain('inset: 0;')
    expect(playerSoftSelectionRule).toContain('opacity: 1;')
    expect(playerSoftSelectionRule).toContain('background:')
    expect(playerSoftSelectionRule).toContain('var(--storm-soft-selection-color)')
    expect(playerSoftSelectionRule).toContain('background-size:')
    expect(playerSoftSelectionRule).toContain('22% 4px,')
    expect(playerSoftSelectionRule).toContain('4px 22%')
    expect(playerSoftSelectionRule).toContain('background-position:')
    expect(playerSoftSelectionRule).not.toContain('border:')
    expect(playerSoftSelectionRule).not.toContain('border-radius')
    expect(opponentSoftSelectionRule).toContain('inset: 0;')
    expect(opponentSoftSelectionRule).toContain('opacity: 1;')
    expect(opponentSoftSelectionRule).toContain('background:')
    expect(opponentSoftSelectionRule).toContain('var(--storm-soft-selection-color)')
    expect(opponentSoftSelectionRule).toContain('background-size:')
    expect(opponentSoftSelectionRule).toContain('22% 4px,')
    expect(opponentSoftSelectionRule).toContain('4px 22%')
    expect(opponentSoftSelectionRule).not.toContain('border:')
    expect(opponentSoftSelectionRule).not.toContain('border-radius')
    expect(stormStyles).toContain(".storm-commander-root .storm-encounter-square[data-faction='pirate']")
    expect(stormStyles).toContain(".storm-commander-root .storm-encounter-square[data-faction='imperial']")
    expect(stormStyles).toContain(".storm-commander-root .storm-encounter-square[data-faction='robocorp']")
    expect(stormStyles).toContain(".storm-commander-root .storm-encounter-square[data-faction='rebel']")
    expect(stormStyles).toContain('--storm-soft-selection-color: rgba(232, 108, 36, 1);')
    expect(stormStyles).toContain('--storm-soft-selection-color: rgba(213, 166, 14, 1);')
    expect(stormStyles).toContain('--storm-soft-selection-color: rgba(85, 170, 242, 1);')
    expect(stormStyles).toContain('--storm-soft-selection-color: rgba(154, 112, 212, 1);')
    expect(activeSelectionRule).toContain('border: 5px solid var(--selected);')
    expect(activeSelectionRule).toContain('border-radius: 50%;')
    expect(encounterLightSquareRule).toContain('background: rgba(255, 255, 255, 0.01265625);')
    expect(lastMoveFromRule).toContain('opacity: 0.3;')
    expect(legalMoveRule).toContain('z-index: 2;')
    expect(legalMoveRule).toContain('width: 10%;')
    expect(legalMoveRule).toContain('height: 10%;')
    expect(legalMoveRule).toContain('clip-path: polygon(50% 0, 100% 100%, 0 100%);')
    expect(legalMoveRule).toContain('opacity: 1;')
    expect(legalMoveRule).toContain(
      'transform: translate(-50%, -50%) rotate(var(--storm-legal-move-angle, 0deg));',
    )
    expect(legalMoveRule).not.toContain('border-radius: 50%;')
    expect(captureRule).toContain('border: 5px solid var(--storm-turn-hint);')
    expect(captureRule).toContain('border-radius: 50%;')
    expect(captureRule).toContain('clip-path: none;')
    expect(captureRule).toContain('linear-gradient(')
    expect(captureRule).toContain('45deg')
    expect(captureRule).toContain('-45deg')
    expect(captureRule).toContain('box-shadow: none;')
    expect(stormStyles).toContain('opacity: 0.42;')
    expect(captureRule).toContain('animation: storm-target-reticle-rotate 2.666s linear infinite')
    expect(stormStyles).not.toContain('@keyframes storm-target-reticle-pulse')
    expect(stormStyles).toContain('@keyframes storm-target-reticle-rotate')
    expect(stormStyles).toContain('transform: rotate(45deg);')
    expect(stormStyles).toContain('transform: rotate(0deg);')
    expect(captureLaserRule).toContain('top: 50%;')
    expect(captureLaserRule).toContain('left: 50%;')
    expect(captureLaserRule).toContain('transform-origin: 0 50%;')
    expect(captureLaserRule).toContain(
      'animation-delay: calc(var(--storm-laser-turn-delay) + var(--storm-laser-index) * 0.12s);',
    )
    expect(stormStyles).toContain('transform: translateY(-50%) rotate(-90deg) scaleX(2.3);')
    expect(extractionSquareRule).toContain('border: 2px dashed rgba(115, 221, 126, 0.9);')
    expect(extractionSquareRule).toContain('animation: storm-extraction-pulse 3.2s ease-in-out infinite;')
    expect(stormStyles).toContain('@keyframes storm-extraction-pulse')
    expect(targetSquareRule).toContain('inset: 8%;')
    expect(targetSquareRule).toContain('border: 2px dashed rgba(115, 221, 126, 0.9);')
    expect(targetSquareRule).toContain('box-shadow: 0 0 16px rgba(115, 221, 126, 0.18);')
    expect(encounterPieceRule).toContain('z-index: 3;')
    expect(encounterPieceRule).toContain('width: 100%;')
    expect(encounterPieceRule).toContain('height: 100%;')
    expect(boardShipRule).toContain('position: absolute;')
    expect(boardShipRule).toContain('top: 50%;')
    expect(boardShipRule).toContain('left: 50%;')
    expect(boardShipRule).toContain('translate: -50% -50%;')
    expect(movementMoveCellRule).toContain('background: var(--storm-comms-faction-color')
    expect(movementMoveCellRule).toContain('box-shadow: 0 0 8px var(--storm-comms-faction-glow')
    expect(movementCaptureHintRule).toContain('background: rgba(177, 181, 174, 0.5);')
    expect(movementCaptureHintRule).toContain('box-shadow: none;')
  })

  it('styles Storm debug chess squares with the main encounter highlight language', () => {
    const stormStyles = readFileSync('src/styles/stormCommander.css', 'utf8')
    const legalMoveRule = stormStyles.match(
      /\.storm-commander-root\.storm-debug-chess-root \.chess-square\.is-legal-move::after\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const captureRule = stormStyles.match(
      /\.storm-commander-root\.storm-debug-chess-root \.chess-square\.is-capture::after\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const activeSelectionRule = stormStyles.match(
      /\.storm-commander-root\.storm-debug-chess-root \.chess-square\.is-selected \.storm-selection-ring\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const lastMoveFromRule = stormStyles.match(
      /\.storm-commander-root\.storm-debug-chess-root \.chess-square\.is-last-move-from::before\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const animationHideRule = stormStyles.match(
      /\.storm-commander-root\.storm-debug-chess-root \.chess-square\.is-move-animation-from \.storm-ship-piece,\s*\n\.storm-commander-root\.storm-debug-chess-root\s+\.chess-square\.is-move-animation-to:not\(\.is-move-animation-capture-to\)\s+\.storm-ship-piece\s*\{(?<body>[^}]+)\}/,
    )?.groups.body

    expect(legalMoveRule).toContain('width: 10%;')
    expect(legalMoveRule).toContain('height: 10%;')
    expect(legalMoveRule).toContain('clip-path: polygon(50% 0, 100% 100%, 0 100%);')
    expect(legalMoveRule).toContain(
      'transform: translate(-50%, -50%) rotate(var(--storm-legal-move-angle, 0deg));',
    )
    expect(captureRule).toContain('border: 5px solid var(--storm-turn-hint);')
    expect(captureRule).toContain('border-radius: 50%;')
    expect(captureRule).toContain('animation: storm-target-reticle-rotate 2.666s linear infinite')
    expect(activeSelectionRule).toContain('border: 5px solid var(--selected);')
    expect(activeSelectionRule).toContain('border-radius: 50%;')
    expect(lastMoveFromRule).toContain('opacity: 0.3;')
    expect(animationHideRule).toContain('opacity: 0;')
  })
})

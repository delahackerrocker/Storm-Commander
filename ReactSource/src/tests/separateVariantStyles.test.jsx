import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'

async function openStartMenuPage(user, pageName) {
  await user.click(screen.getByRole('button', { name: pageName }))
}

describe('separate variant style sources', () => {
  it('renders Basic Chess inside the Storm debug chess style root', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await openStartMenuPage(user, /^Basic Chess$/)

    expect(container.querySelector('.storm-commander-root')).toBeInTheDocument()
    expect(container.querySelector('.storm-debug-chess-root')).toBeInTheDocument()
    expect(container.querySelector('.standard-chess-root')).not.toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(32)
  })

  it('renders Storm Commander inside the storm style root only', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)

    await openStartMenuPage(user, /^Storm Chess Drill$/)

    expect(container.querySelector('.storm-commander-root')).toBeInTheDocument()
    expect(container.querySelector('.standard-chess-root')).not.toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(32)
  })

  it('allows Storm debug chess pages to scroll while Random Encounter stays locked', () => {
    const stormStyles = readFileSync('src/styles/stormCommander.css', 'utf8')
    const debugRootRule = stormStyles.match(
      /\.storm-commander-root\.storm-encounter-root\.storm-debug-chess-root\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const encounterRootRule = stormStyles.match(
      /\.storm-commander-root\.storm-encounter-root\s*\{(?<body>[^}]+)\}/,
    )?.groups.body

    expect(encounterRootRule).toContain('height: 100dvh;')
    expect(encounterRootRule).toContain('overflow: hidden;')
    expect(debugRootRule).toContain('height: auto;')
    expect(debugRootRule).toContain('min-height: 100dvh;')
    expect(debugRootRule).toContain('overflow: visible;')
    expect(debugRootRule).toContain('padding-bottom: 96px;')
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

  it('anchors play mode controls in a bottom-left dock', () => {
    const globalStyles = readFileSync('src/styles.css', 'utf8')
    const playControlsRule = globalStyles.match(
      /\.play-controls\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const playControlChildrenRule = globalStyles.match(
      /\.play-controls > \*\s*\{(?<body>[^}]+)\}/,
    )?.groups.body

    expect(playControlsRule).toContain('position: fixed;')
    expect(playControlsRule).toContain('left: 16px;')
    expect(playControlsRule).toContain('bottom: 16px;')
    expect(playControlsRule).toContain('display: flex;')
    expect(playControlsRule).toContain('align-items: center;')
    expect(playControlsRule).toContain('gap: 8px;')
    expect(playControlsRule).toContain('z-index: 30;')
    expect(playControlsRule).toContain('pointer-events: none;')
    expect(playControlChildrenRule).toContain('pointer-events: auto;')
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
    const playerCommsStackRule = stormStyles.match(
      /\.storm-commander-root \.storm-player-comms-stack\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const playerCommsStackWindowRule = stormStyles.match(
      /\.storm-commander-root \.storm-player-comms-stack > \.storm-comms-window-player\s*\{(?<body>[^}]+)\}/,
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
      .find((body) => body.includes('font-size: 1.14rem;'))
    const commsTitleLineRule = stormStyles.match(
      /\.storm-commander-root \.storm-comms-title-faction,\s*\n\.storm-commander-root \.storm-comms-title-class\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const commsTitleClassRule = [...stormStyles.matchAll(
      /\.storm-commander-root \.storm-comms-title-class\s*\{(?<body>[^}]+)\}/g,
    )].map((match) => match.groups.body)
      .find((body) => body.includes('font-size: 0.92em;'))
    const stackedCommsTitleRule = [...stormStyles.matchAll(
      /\.storm-commander-root \.storm-comms-window h2\s*\{(?<body>[^}]+)\}/g,
    )].map((match) => match.groups.body)
      .find((body) => body.includes('font-size: 1.75rem;'))
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
    const playerObjectiveStatusRule = stormStyles.match(
      /\.storm-commander-root \.storm-player-objective-status\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const playerObjectiveStatusTitleRule = stormStyles.match(
      /\.storm-commander-root \.storm-player-objective-status h2\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const playerObjectiveProgressRule = stormStyles.match(
      /\.storm-commander-root \.storm-player-objective-status \.storm-objective-progress\s*\{(?<body>[^}]+)\}/,
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
    const phonePortraitBreakpointIndex = stormStyles.indexOf(
      '@media (max-width: 560px) and (orientation: portrait)',
    )
    const compactCommsIndex = stormStyles.indexOf(
      'grid-template-columns: 43px 43px 43px minmax(0, 1fr);',
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
    expect(stormStyles).toContain('--storm-player-faction-stroke: rgba(232, 108, 36, 0.9);')
    expect(encounterRootRule).toContain(
      'radial-gradient(circle at 86% 8%, rgba(89, 30, 58, 0.42), transparent 32%)',
    )
    expect(shellRule).toContain(
      'grid-template-columns: minmax(180px, 250px) minmax(320px, 760px) minmax(180px, 250px);',
    )
    expect(shellRule).toContain('--storm-encounter-board-max-size: calc(100dvh - 72px);')
    expect(shellRule).toContain('"opponent-comms board player-comms"')
    expect(shellRule).not.toContain('encounter-status')
    expect(shellRule).toContain('width: min(1320px, calc(100vw - 32px));')
    expect(shellRule).toContain('justify-content: center;')
    expect(encounterBoardRule).toContain('border: 4px solid var(--storm-turn-hint);')
    expect(encounterBoardRule).toContain('box-sizing: border-box;')
    expect(encounterBoardRule).toContain('width: min(100%, var(--storm-encounter-board-max-size));')
    expect(encounterBoardRule).toContain('margin: 0 auto;')
    expect(encounterLightSquareRule).toContain('background: rgba(255, 255, 255, 0.010125);')
    expect(panelRule).toContain('position: fixed;')
    expect(panelRule).toContain('left: 50%;')
    expect(panelRule).toContain('bottom: 16px;')
    expect(panelRule).toContain('box-sizing: border-box;')
    expect(panelRule).toContain('width: min(1320px, calc(100vw - 32px));')
    expect(panelRule).toContain('transform: translateX(-50%);')
    expect(panelRule).toContain('display: flex;')
    expect(panelRule).toContain('align-items: center;')
    expect(panelRule).toContain('gap: 8px;')
    expect(panelRule).toContain('z-index: 30;')
    expect(missionStatusButtonRule).toContain('min-width: 112px;')
    expect(missionStatusButtonRule).toContain('min-height: 38px;')
    expect(missionStatusButtonRule).toContain('border: 1px solid var(--storm-player-faction-stroke);')
    expect(missionStatusButtonRule).toContain('border-radius: 7px;')
    expect(missionStatusButtonRule).toContain('padding: 8px 13px;')
    expect(missionStatusButtonRule).toContain('color: var(--storm-old-ivory);')
    expect(missionStatusButtonRule).toContain('background: rgba(17, 19, 3, 0.86);')
    expect(missionStatusButtonRule).toContain(
      'box-shadow: inset 0 0 0 1px rgba(243, 240, 223, 0.08);',
    )
    expect(missionStatusButtonRule).toContain('font-size: 0.84rem;')
    expect(missionStatusButtonRule).toContain('font-weight: 900;')
    expect(missionStatusButtonFocusRule).toContain('background: rgba(17, 19, 3, 0.96);')
    expect(missionStatusButtonFocusRule).toContain('outline: 3px solid var(--storm-cannon-cyan);')
    expect(commsWindowRule).toContain('box-sizing: border-box;')
    expect(commsWindowRule).toContain('position: relative;')
    expect(commsWindowRule).toContain('--storm-comms-tile-gap: 10px;')
    expect(commsWindowRule).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));')
    expect(commsWindowRule).toContain('grid-template-areas:')
    expect(commsWindowRule).toContain('"hero hero"')
    expect(commsWindowRule).toContain('"portrait movement"')
    expect(commsWindowRule).toContain('"title title"')
    expect(commsWindowRule).toContain('"bark bark";')
    expect(commsWindowRule).toContain('justify-self: stretch;')
    expect(commsWindowRule).toContain('width: 100%;')
    expect(commsWindowRule).toContain('border: 2px solid var(--storm-comms-faction-color')
    expect(commsWindowRule).toContain('0 0 18px var(--storm-comms-faction-glow')
    expect(playerCommsStackRule).toContain('grid-area: player-comms;')
    expect(playerCommsStackRule).toContain('display: grid;')
    expect(playerCommsStackRule).toContain('gap: 14px;')
    expect(playerCommsStackRule).toContain('align-content: start;')
    expect(playerCommsStackWindowRule).toContain('grid-area: auto;')
    expect(playerCommsRule).toContain('grid-area: player-comms;')
    expect(playerCommsRule).not.toContain('"movement portrait hero"')
    expect(opponentCommsRule).toContain('grid-area: opponent-comms;')
    expect(stormStyles).not.toContain('.storm-commander-root .storm-mission-summary-row')
    expect(stormStyles).not.toContain('.storm-commander-root .storm-mission-summary-button')
    expect(stormStyles).not.toContain('storm-mission-summary-new-encounter')
    expect(stackedMediaRule).toContain('.storm-commander-root .storm-encounter-shell')
    expect(stackedMediaRule).toContain('.storm-commander-root .storm-encounter-panel')
    expect(stackedMediaRule).toContain('width: min(760px, calc(100vw - 32px));')
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
    expect(stackedMediaRule).toContain('grid-template-areas: "title movement portrait hero";')
    expect(stackedMediaRule).toContain('text-align: right;')
    expect(stormStyles).toContain('@media (max-width: 560px)')
    expect(stormStyles).toContain('gap: 8px;')
    expect(stormStyles).toContain('width: 36px;')
    expect(verticalMediaRule).not.toContain('"player-comms"')
    expect(verticalMediaRule).toContain('.storm-commander-root .storm-encounter-panel')
    expect(verticalMediaRule).toContain('width: min(720px, calc(100vw - 24px));')
    expect(verticalMediaRule).not.toContain('grid-template-columns: 43px 43px 43px minmax(0, 1fr);')
    expect(verticalMediaRule).not.toContain('width: 43px;')
    expect(phoneMediaRule).not.toContain('.storm-commander-root .storm-mission-status-button')
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
    expect(movementRule).toContain(
      'border: 1px solid var(--storm-comms-faction-color, rgba(107, 110, 58, 0.72));',
    )
    expect(barkRule).toContain('display: none;')
    expect(stormStyles).toContain('grid-template-columns: 85px 85px 85px minmax(130px, 1fr);')
    expect(stormStyles).toContain('grid-template-areas: "hero portrait movement title";')
    expect(stormStyles).toContain('grid-area: portrait;')
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-window[data-faction='pirate']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-window[data-faction='imperial']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-window[data-faction='robocorp']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-window[data-faction='rebel']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-portrait[data-faction='pirate']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-portrait[data-faction='imperial']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-portrait[data-faction='robocorp']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-portrait[data-faction='rebel']")
    expect(stormStyles).toContain(".storm-commander-root .storm-comms-hero-portrait[data-faction='pirate']")
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
    expect(commsTitleRule).toContain('display: grid;')
    expect(commsTitleLineRule).toContain('display: block;')
    expect(commsTitleClassRule).toContain('font-size: 0.92em;')
    expect(stackedCommsTitleRule).toContain('font-size: 1.75rem;')
    expect(stackedCommsTitleRule).toContain('white-space: normal;')
    expect(stormStyles).toContain('display: contents;')
    expect(stormStyles).toContain('grid-template-columns: 43px 43px 43px minmax(0, 1fr);')
    expect(compactCommsIndex).toBeGreaterThan(phonePortraitBreakpointIndex)
    expect(stormStyles).toContain('width: 43px;')
    expect(stormStyles).toContain('height: 43px;')
    expect(stormStyles).toContain('grid-template-columns: repeat(5, minmax(0, 1fr));')
    expect(stormStyles).toContain('grid-template-rows: repeat(5, minmax(0, 1fr));')
    expect(stormStyles).toContain('width: 100%;')
    expect(stormStyles).toContain('height: 100%;')
    expect(stormStyles).not.toContain('width: max-content;')
    expect(stormStyles).toContain('font-size: 1.28rem;')
    expect(stormStyles).toContain('display: none;')
    expect(missionOverlayRule).toContain('place-items: center;')
    expect(missionOverlayRule).toContain('padding: 24px;')
    expect(missionOverlayRule).toContain('background: rgba(0, 0, 0, 0.5);')
    expect(missionDialogRule).toContain('box-sizing: border-box;')
    expect(missionDialogRule).toContain('width: min(760px, calc(100vw - 32px));')
    expect(missionDialogRule).toContain('max-height: calc(100dvh - 48px);')
    expect(missionDialogRule).toContain('align-self: center;')
    expect(missionDialogRule).toContain('justify-self: center;')
    expect(missionDialogRule).toContain('margin: auto;')
    expect(missionDialogRule).toContain('align-content: center;')
    expect(missionDialogRule).toContain('border-radius: var(--radius);')
    expect(stormStyles).toContain('padding: 22px;')
    expect(stormStyles).not.toContain('padding: 76px 18px 22px;')
    expect(stormStyles).not.toContain('storm-mission-return-note')
    expect(missionDismissRule).not.toContain('position: absolute;')
    expect(missionDismissRule).toContain('justify-self: end;')
    expect(objectivePanelRule).toBeDefined()
    expect(objectivePanelRule).toContain('grid-template-columns: minmax(0, 1fr) auto;')
    expect(objectivePanelRule).toContain('align-items: center;')
    expect(playerObjectiveStatusRule).toContain('border: 1px solid var(--storm-player-faction-stroke);')
    expect(playerObjectiveStatusRule).toContain('padding: 14px;')
    expect(playerObjectiveStatusRule).toContain(
      'radial-gradient(circle at 16% 0%, var(--storm-player-faction-bg), transparent 48%)',
    )
    expect(playerObjectiveStatusRule).toContain('rgba(17, 19, 3, 0.88)')
    expect(playerObjectiveStatusRule).toContain('0 0 18px rgba(232, 108, 36, 0.32)')
    expect(playerObjectiveStatusTitleRule).toContain('color: var(--storm-pirate-orange);')
    expect(playerObjectiveProgressRule).toContain('color: var(--storm-pirate-orange);')
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
    expect(movementRule).toContain('grid-template-columns: repeat(5, minmax(0, 1fr));')
    expect(movementRule).toContain('grid-template-rows: repeat(5, minmax(0, 1fr));')
    expect(movementRule).toContain('border: 1px solid var(--storm-comms-faction-color')
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
    expect(selectionFlashRule).toContain('animation: storm-selection-flash 0.3s steps(9, end) forwards;')
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
    expect(stormStyles).toContain('--storm-active-selection-color: rgba(232, 108, 36, 0.9);')
    expect(stormStyles).toContain('--storm-active-selection-color: rgba(213, 166, 14, 0.92);')
    expect(stormStyles).toContain('--storm-active-selection-color: rgba(85, 170, 242, 0.9);')
    expect(stormStyles).toContain('--storm-active-selection-color: rgba(154, 112, 212, 0.92);')
    expect(activeSelectionRule).toContain(
      'border: 5px solid var(--storm-active-selection-color, var(--selected));',
    )
    expect(activeSelectionRule).toContain('border-radius: 50%;')
    expect(encounterLightSquareRule).toContain('background: rgba(255, 255, 255, 0.010125);')
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
    expect(captureRule).toContain('animation: storm-target-reticle-rotate 2667ms steps(80, end) infinite')
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
    expect(extractionSquareRule).toContain('animation: storm-extraction-pulse 3.2s steps(96, end) infinite;')
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

  it('keeps Storm Commander rocket exhaust animated on normal board pieces', () => {
    const stormStyles = readFileSync('src/styles/stormCommander.css', 'utf8')
    const exhaustRule = stormStyles.match(
      /\.storm-commander-root \.storm-rocket-exhaust\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const reducedMotionRule = stormStyles.match(
      /@media \(prefers-reduced-motion: reduce\)\s*\{(?<body>[\s\S]+?)\n\}/,
    )?.groups.body

    expect(exhaustRule).toContain(
      'animation: storm-rocket-exhaust-flicker 240ms steps(7, end) infinite alternate;',
    )
    expect(exhaustRule).toContain('animation-delay: var(--storm-exhaust-delay);')
    expect(exhaustRule).toContain(
      'animation-play-state: var(--storm-board-animation-play-state, running);',
    )
    expect(exhaustRule).not.toContain('animation: none;')
    expect(reducedMotionRule).not.toContain('.storm-commander-root .storm-rocket-exhaust')
  })

  it('caps Storm Commander board animation timing and pauses board motion under mission details', () => {
    const stormStyles = readFileSync('src/styles/stormCommander.css', 'utf8')
    const starfieldRule = [...stormStyles.matchAll(
      /\.storm-commander-root \.storm-starfield-layer\s*\{(?<body>[^}]+)\}/g,
    )].map((match) => match.groups.body)
      .find((body) => body.includes('transition: background-position'))
    const shipPieceRule = stormStyles.match(
      /\.storm-commander-root \.storm-ship-piece\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const missionBriefingRootRule = stormStyles.match(
      /\.storm-commander-root\.is-mission-briefing-open\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const boardPauseRule = stormStyles.match(
      /\.storm-commander-root\.storm-encounter-root \.storm-encounter-shell \*,\s*\n\.storm-commander-root\.storm-encounter-root \.storm-encounter-panel \*\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const selectionFlashRule = stormStyles.match(
      /\.storm-commander-root \.storm-selection-flash\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const reticleRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square\.is-capture::after\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const extractionRule = stormStyles.match(
      /\.storm-commander-root \.storm-encounter-square\.is-extraction::before\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const attackerRule = stormStyles.match(
      /\.storm-commander-root \.storm-capture-attacker\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const laserRule = stormStyles.match(
      /\.storm-commander-root \.storm-capture-laser\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const sparkRule = stormStyles.match(
      /\.storm-commander-root \.storm-capture-hit-spark\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const explosionRule = [...stormStyles.matchAll(
      /\.storm-commander-root \.storm-capture-explosion\s*\{(?<body>[^}]+)\}/g,
    )].map((match) => match.groups.body)
      .find((body) => body.includes('animation: storm-capture-explosion'))

    expect(starfieldRule).toContain(
      'transition: background-position var(--storm-star-tween-ms) steps(var(--storm-star-step-count), end);',
    )
    expect(shipPieceRule).toContain(
      'transition: transform var(--storm-star-tween-ms) steps(var(--storm-star-step-count), end);',
    )
    expect(missionBriefingRootRule).toContain('--storm-board-animation-play-state: paused;')
    expect(missionBriefingRootRule).toContain('--storm-star-tween-ms: 0ms;')
    expect(boardPauseRule).toContain(
      'animation-play-state: var(--storm-board-animation-play-state, running);',
    )
    expect(selectionFlashRule).toContain('animation: storm-selection-flash 0.3s steps(9, end) forwards;')
    expect(reticleRule).toContain('animation: storm-target-reticle-rotate 2667ms steps(80, end) infinite')
    expect(extractionRule).toContain('animation: storm-extraction-pulse 3.2s steps(96, end) infinite;')
    expect(attackerRule).toContain('animation: storm-capture-attacker-flight 1.2s steps(36, end) forwards;')
    expect(laserRule).toContain('animation: storm-capture-laser-fire 180ms steps(5, end) forwards;')
    expect(sparkRule).toContain('animation: storm-capture-hit-spark 220ms steps(6, end) forwards;')
    expect(explosionRule).toContain('animation: storm-capture-explosion 300ms steps(9, end) forwards;')
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
    expect(captureRule).toContain('animation: storm-target-reticle-rotate 2667ms steps(80, end) infinite')
    expect(activeSelectionRule).toContain('border: 5px solid var(--selected);')
    expect(activeSelectionRule).toContain('border-radius: 50%;')
    expect(lastMoveFromRule).toContain('opacity: 0.3;')
    expect(animationHideRule).toContain('opacity: 0;')
  })
})

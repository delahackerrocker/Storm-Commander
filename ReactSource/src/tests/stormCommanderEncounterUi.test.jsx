import { useState } from 'react'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'
import { StormCommanderEncounterPage } from '../storm-commander/components/StormCommanderEncounterPage'

async function renderRandomEncounterApp(user) {
  const renderResult = render(<App />)

  await user.click(screen.getByRole('button', { name: /^Random Encounter$/ }))

  return renderResult
}

describe('Storm Commander random encounter UI', () => {
  it('marks board and ship animations paused while the mission briefing is open', async () => {
    const user = userEvent.setup()
    const onBoardAnimationsPausedChange = vi.fn()
    const encounter = {
      id: 'test_animation_pause_briefing',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
      ],
    }

    const { container } = render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onBoardAnimationsPausedChange={onBoardAnimationsPausedChange}
        onNewEncounter={() => {}}
        setEncounter={() => {}}
      />,
    )

    const root = container.querySelector('.storm-encounter-root')

    expect(root).toHaveClass('is-mission-briefing-open')
    await waitFor(() => {
      expect(onBoardAnimationsPausedChange).toHaveBeenLastCalledWith(true)
    })

    await user.click(screen.getByRole('button', { name: /^Battle$/ }))

    expect(root).not.toHaveClass('is-mission-briefing-open')
    await waitFor(() => {
      expect(onBoardAnimationsPausedChange).toHaveBeenLastCalledWith(false)
    })
  })

  it('opens mission details as a dismissible briefing that can be restored', async () => {
    const user = userEvent.setup()
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    try {
      const { container } = await renderRandomEncounterApp(user)

      const missionDialog = screen.getByRole('dialog', { name: /^Random Pirate Raid$/ })
      const encounterStatusButton = screen.getByRole('button', {
        name: /Mission status\. Objective: .+\. Progress: .+\. Open mission briefing\./,
      })

      expect(missionDialog).toBeInTheDocument()
      expect(
        within(missionDialog).getByRole('heading', { name: /^Random Pirate Raid$/ }),
      ).toBeInTheDocument()
      expect(within(missionDialog).getByText(/Objective:/)).toBeInTheDocument()
      expect(within(missionDialog).getByRole('button', { name: /^Battle$/ }))
        .toBeInTheDocument()
      expect(within(missionDialog).queryByRole('button', { name: /^Dismiss$/ }))
        .not.toBeInTheDocument()
      expect(
        within(missionDialog).queryByText(
          /^Dismiss this briefing to command the board\. Use Mission in the HUD to reopen it\.$/,
        ),
      ).not.toBeInTheDocument()
      expect(container.querySelector('.storm-mission-return-note')).not.toBeInTheDocument()
      expect(within(missionDialog).queryByText(/^Status$/)).not.toBeInTheDocument()
      expect(within(missionDialog).queryByText(/^Board$/)).not.toBeInTheDocument()
      expect(within(missionDialog).getByText(/^Factions$/)).toBeInTheDocument()
      const briefingFactionNames = [
        ...missionDialog.querySelectorAll('.storm-mission-faction-name'),
      ]
      expect(briefingFactionNames).toHaveLength(2)
      expect(briefingFactionNames.map((factionName) => factionName.textContent)).toEqual([
        'Pirate',
        'Imperial',
      ])
      expect(briefingFactionNames.map((factionName) => factionName.dataset.faction)).toEqual([
        'pirate',
        'imperial',
      ])
      expect(within(missionDialog).getByText(/^AI$/)).toBeInTheDocument()
      const briefingAiType = missionDialog.querySelector('.storm-mission-ai-type')
      expect(briefingAiType).toHaveTextContent(/^Sloppy Aggressive$/)
      expect(briefingAiType).toHaveAttribute('data-faction', 'imperial')
      expect(encounterStatusButton).toHaveTextContent('Mission')
      expect(screen.queryByRole('complementary', { name: /^Encounter status$/ }))
        .not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^Mission$/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^New Random Encounter$/ }))
        .not.toBeInTheDocument()
      expect(container.querySelector('.storm-encounter-topbar')).not.toBeInTheDocument()
      expect(container.querySelector('.storm-encounter-topbar .storm-mission-button'))
        .not.toBeInTheDocument()
      expect(container.querySelector('.storm-encounter-topbar .storm-icon-button'))
        .not.toBeInTheDocument()

      await user.click(within(missionDialog).getByRole('button', { name: /^Battle$/ }))

      expect(screen.queryByRole('dialog', { name: /^Random Pirate Raid$/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /^Random Pirate Raid$/ })).not.toBeInTheDocument()
      expect(encounterStatusButton).toBeInTheDocument()
      expect(screen.getByRole('complementary', { name: /^Player comms$/ })).toBeInTheDocument()
      expect(screen.getByRole('complementary', { name: /^Opponent comms$/ })).toBeInTheDocument()

      await user.click(encounterStatusButton)

      expect(screen.getByRole('dialog', { name: /^Random Pirate Raid$/ })).toBeInTheDocument()
    } finally {
      randomSpy.mockRestore()
    }
  })

  it('generates an encounter and shows player and opponent comms panels', async () => {
    const user = userEvent.setup()
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    try {
      const { container } = await renderRandomEncounterApp(user)

      await user.click(screen.getByRole('button', { name: /^Battle$/ }))

      const encounterStatusButton = screen.getByRole('button', {
        name: /Mission status\. Objective: .+\. Progress: .+\. Open mission briefing\./,
      })

      expect(encounterStatusButton).toHaveTextContent('Mission')
      expect(screen.queryByRole('complementary', { name: /^Encounter status$/ }))
        .not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^Mission$/ })).not.toBeInTheDocument()
      expect(container.querySelector('.storm-encounter-topbar')).not.toBeInTheDocument()
      expect(container.querySelector('.storm-encounter-topbar .storm-mission-button'))
        .not.toBeInTheDocument()
      expect(container.querySelector('.storm-encounter-topbar .storm-icon-button'))
        .not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^New Random Encounter$/ }))
        .not.toBeInTheDocument()
      expect(container.querySelector('.storm-mission-summary-line')).not.toBeInTheDocument()
      expect(screen.getAllByTestId('storm-encounter-square').length).toBe(25)

      const playerComms = screen.getByRole('complementary', { name: /^Player comms$/ })
      const opponentComms = screen.getByRole('complementary', { name: /^Opponent comms$/ })
      const playerTitle = within(playerComms).getByRole('heading', {
        name: /^Pirate [A-Z][a-z]+ Class$/i,
      })
      const opponentTitle = within(opponentComms).getByRole('heading', {
        name: /^Imperial [A-Z][a-z]+ Class$/i,
      })

      expect(within(playerComms).getByRole('img', { name: /Pirate .* comms portrait/i }))
        .toBeInTheDocument()
      expect(within(opponentComms).getByRole('img', { name: /Imperial .* comms portrait/i }))
        .toBeInTheDocument()
      expect(playerTitle.querySelector('.storm-comms-title-faction')).toHaveTextContent(/^Pirate$/)
      expect(playerTitle.querySelector('.storm-comms-title-class'))
        .toHaveTextContent(/^[A-Z][a-z]+ Class$/)
      expect(opponentTitle.querySelector('.storm-comms-title-faction'))
        .toHaveTextContent(/^Imperial$/)
      expect(opponentTitle.querySelector('.storm-comms-title-class'))
        .toHaveTextContent(/^[A-Z][a-z]+ Class$/)
      expect(within(playerComms).getByRole('img', { name: /Pirate .* comms portrait/i }))
        .toHaveAttribute('data-faction', 'pirate')
      expect(within(opponentComms).getByRole('img', { name: /Imperial .* comms portrait/i }))
        .toHaveAttribute('data-faction', 'imperial')
      expect(playerComms).toHaveAttribute('data-faction', 'pirate')
      expect(opponentComms).toHaveAttribute('data-faction', 'imperial')
      expect(container.querySelector('.storm-encounter-root')).toHaveStyle(
        '--storm-player-faction-bg: rgba(232, 108, 36, 0.24)',
      )
      expect(container.querySelector('.storm-encounter-root')).toHaveStyle(
        '--storm-player-faction-stroke: rgba(232, 108, 36, 0.9)',
      )
      expect(container.querySelector('.storm-encounter-root')).toHaveStyle(
        '--storm-opponent-faction-bg: rgba(213, 166, 14, 0.26)',
      )
      expect(within(playerComms).queryByText(/^PLAYER COMMS$/)).not.toBeInTheDocument()
      expect(within(opponentComms).queryByText(/^OPPONENT COMMS$/)).not.toBeInTheDocument()
      expect(within(playerComms).queryByText(/^Faction$/)).not.toBeInTheDocument()
      expect(within(opponentComms).queryByText(/^Faction$/)).not.toBeInTheDocument()
      expect(within(playerComms).queryByText(/^Ship$/)).not.toBeInTheDocument()
      expect(within(opponentComms).queryByText(/^Ship$/)).not.toBeInTheDocument()
      expect(within(playerComms).queryByText(/^Square$/)).not.toBeInTheDocument()
      expect(within(opponentComms).queryByText(/^Square$/)).not.toBeInTheDocument()
      expect(container.querySelector('.storm-comms-movement')).not.toBeInTheDocument()
      expect(playerComms.querySelector('.storm-comms-transmission .storm-movement-pattern'))
        .toBeInTheDocument()
      expect(playerComms.querySelector('.storm-comms-transmission .storm-movement-pattern'))
        .toHaveAttribute('data-faction', 'pirate')
      expect(opponentComms.querySelector('.storm-comms-transmission .storm-movement-pattern'))
        .toHaveAttribute('data-faction', 'imperial')
      expect(
        playerComms.querySelectorAll(
          '.storm-movement-pattern-cell:not(.is-move):not(.is-origin)',
        ),
      ).toHaveLength(0)
      expect(
        opponentComms.querySelectorAll(
          '.storm-movement-pattern-cell:not(.is-move):not(.is-origin)',
        ),
      ).toHaveLength(0)

      await user.click(screen.getAllByRole('button', { name: /Pirate .* square/i })[0])

      expect(within(playerComms).getByRole('img', { name: /Pirate .* comms portrait/i }))
        .toBeInTheDocument()
      expect(within(playerComms).getByRole('img', { name: /Moves/i })).toHaveClass(
        'storm-movement-pattern',
      )
      expect(within(playerComms).getByRole('img', { name: /Moves/i })).toHaveAttribute(
        'data-faction',
        'pirate',
      )
      expect(within(playerComms).queryByText(/^Movement$/)).not.toBeInTheDocument()
      expect(within(playerComms).getByRole('heading', {
        name: /^Pirate [A-Z][a-z]+ Class$/i,
      }))
        .toBeInTheDocument()
      expect(within(playerComms).queryByRole('heading', { name: /: [A-Z][1-9]/i }))
        .not.toBeInTheDocument()
    } finally {
      randomSpy.mockRestore()
    }
  })

  it('shows objective status directly under the player comms panel after the briefing closes', async () => {
    const user = userEvent.setup()
    const encounter = {
      id: 'test_player_comms_objective_status',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 7,
        turnsElapsed: 0,
        text: 'Survive 7 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
      ],
    }

    const { container } = render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        setEncounter={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: /^Battle$/ }))

    const playerCommsStack = container.querySelector('.storm-player-comms-stack')
    const playerComms = screen.getByRole('complementary', { name: /^Player comms$/ })
    const objectiveStatus = screen.getByRole('region', { name: /^Player objective status$/ })

    expect(playerCommsStack).toContainElement(playerComms)
    expect(playerCommsStack).toContainElement(objectiveStatus)
    expect([...playerCommsStack.children]).toEqual([playerComms, objectiveStatus])
    expect(within(objectiveStatus).getByRole('heading', { name: /^Objective: Survive 7 Turns$/ }))
      .toBeInTheDocument()
    expect(within(objectiveStatus).getByText(/^Survive 7 turns until the jump drive charges\.$/))
      .toBeInTheDocument()
    expect(within(objectiveStatus).getByText(/^0\/7 turns survived$/))
      .toHaveClass('storm-objective-progress')
  })

  it('labels capture value objectives as capture ships in the player status panel', async () => {
    const user = userEvent.setup()
    const encounter = {
      id: 'test_player_comms_capture_ships_status',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'robocorp'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'robocorp'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Robocorp signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'captureValue',
        valueRequired: 6,
        text: 'Capture enough enemy ships to break their formation.',
      },
      pieces: [
        { id: 'pirate_queen', faction: 'pirate', type: 'q', square: { x: 1, y: 1 } },
        { id: 'robocorp_pawn', faction: 'robocorp', type: 'p', square: { x: 3, y: 1 } },
      ],
    }

    render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        setEncounter={() => {}}
      />,
    )

    expect(screen.getByRole('button', {
      name: /Mission status\. Objective: Capture Ships\. Progress: 0\/6 value captured\./,
    })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Battle$/ }))

    const objectiveStatus = screen.getByRole('region', { name: /^Player objective status$/ })

    expect(within(objectiveStatus).getByRole('heading', { name: /^Objective: Capture Ships$/ }))
      .toBeInTheDocument()
    expect(within(objectiveStatus).getByText(/^Capture enough enemy ships to break their formation\.$/))
      .toBeInTheDocument()
    expect(within(objectiveStatus).getByText(/^0\/6 value captured$/))
      .toHaveClass('storm-objective-progress')
  })

  it('shows an extraction icon on the mission briefing objective panel', () => {
    const encounter = {
      id: 'test_escape_briefing_marker',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'escapeToSquare',
        extractionSquare: { x: 2, y: 4 },
        text: 'Move any Pirate ship to the extraction square.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
      ],
    }

    const { container } = render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    const missionDialog = screen.getByRole('dialog', { name: /^Random Pirate Raid$/ })
    const objectivePanel = container.querySelector('.storm-objective-panel')

    expect(within(missionDialog).getByLabelText(/^Extraction target C1$/)).toBeInTheDocument()
    expect(objectivePanel.querySelector('.storm-objective-copy')).toBeInTheDocument()
    expect(objectivePanel.querySelector('.storm-objective-target-icon.is-extraction'))
      .toBeInTheDocument()
    expect(objectivePanel.querySelector('.storm-objective-target-square'))
      .not.toBeInTheDocument()
  })

  it('shows the target ship icon on destroy target mission briefings', () => {
    const encounter = {
      id: 'test_destroy_target_briefing_marker',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'destroyTarget',
        targetPieceId: 'imperial_queen',
        text: 'Destroy the Imperial Queen.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
      ],
    }

    const { container } = render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    const missionDialog = screen.getByRole('dialog', { name: /^Random Pirate Raid$/ })
    const objectivePanel = container.querySelector('.storm-objective-panel')

    expect(within(missionDialog).getByRole('img', { name: /^Imperial queen target$/ }))
      .toBeInTheDocument()
    expect(objectivePanel.querySelector('.storm-objective-target-icon.is-target'))
      .toBeInTheDocument()
  })

  it('seeds player comms with a player ship at encounter start', async () => {
    const user = userEvent.setup()
    const encounter = {
      id: 'a',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'pirate_queen', faction: 'pirate', type: 'q', square: { x: 2, y: 1 } },
        { id: 'imperial_pawn', faction: 'imperial', type: 'p', square: { x: 3, y: 1 } },
      ],
    }

    render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: /^Battle$/ }))

    const playerComms = screen.getByRole('complementary', { name: /^Player comms$/ })

    expect(within(playerComms).getByRole('heading', { name: /^Pirate Queen Class$/ }))
      .toBeInTheDocument()
    expect(within(playerComms).queryByRole('heading', { name: /^Pirate Queen Class : C4$/ }))
      .not.toBeInTheDocument()
    expect(within(playerComms).getByRole('img', { name: /^Prank Sumatra hero portrait$/ }))
      .toBeInTheDocument()
  })

  it('keeps the last selected player ship in comms after the move selection clears', async () => {
    vi.useFakeTimers()
    const encounter = {
      id: 'test_player_comms_persist',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_pawn', faction: 'imperial', type: 'p', square: { x: 3, y: 4 } },
      ],
    }

    function Harness() {
      const [currentEncounter, setEncounter] = useState(encounter)

      return (
        <StormCommanderEncounterPage
          encounter={currentEncounter}
          onBack={() => {}}
          onNewEncounter={() => {}}
          onReturnToChess={() => {}}
          setEncounter={setEncounter}
        />
      )
    }

    try {
      render(<Harness />)

      fireEvent.click(screen.getByRole('button', { name: /^Battle$/ }))
      fireEvent.click(screen.getByRole('button', { name: /Pirate rook square/i }))
      fireEvent.click(screen.getByRole('button', { name: /A4 empty legal destination/i }))

      await act(async () => {
        vi.advanceTimersByTime(1200)
      })

      const playerComms = screen.getByRole('complementary', { name: /^Player comms$/ })

      expect(within(playerComms).getByRole('heading', { name: /^Pirate Rook Class$/ }))
        .toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('plays a cosmetic move animation and locks board input before applying a capture', async () => {
    vi.useFakeTimers()
    const encounter = {
      id: 'test_capture_animation',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'pirate_pawn', faction: 'pirate', type: 'p', square: { x: 0, y: 4 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
      ],
    }

    function Harness() {
      const [currentEncounter, setEncounter] = useState(encounter)

      return (
        <StormCommanderEncounterPage
          encounter={currentEncounter}
          onBack={() => {}}
          onNewEncounter={() => {}}
          onReturnToChess={() => {}}
          setEncounter={setEncounter}
        />
      )
    }

    try {
      const { container } = render(<Harness />)

      fireEvent.click(screen.getByRole('button', { name: /^Battle$/ }))
      fireEvent.click(screen.getByRole('button', { name: /Pirate rook square/i }))
      fireEvent.click(screen.getByRole('button', { name: /Imperial queen capture destination/i }))

      expect(container.querySelector('.storm-capture-animation-layer')).toBeInTheDocument()
      expect(container.querySelector('.storm-capture-attacker')).toHaveAttribute(
        'data-faction',
        'pirate',
      )
      expect(container.querySelector('.storm-capture-lasers')?.parentElement).toHaveClass(
        'storm-capture-attacker',
      )
      expect(container.querySelectorAll('.storm-capture-laser')).toHaveLength(5)
      container.querySelectorAll('.storm-capture-laser').forEach((laser) => {
        expect(laser).toHaveStyle('--storm-laser-turn-delay: 0.2s')
      })
      expect(container.querySelectorAll('.storm-capture-hit-spark')).toHaveLength(4)
      expect(container.querySelector('.storm-capture-explosion')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /B4 Pirate rook square/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /D4 Imperial queen capture destination/i }))
        .toBeDisabled()
      const targetSquare = screen.getByRole('button', {
        name: /D4 Imperial queen capture destination/i,
      })

      expect(targetSquare).toBeInTheDocument()
      expect(targetSquare.querySelector('.storm-ship-piece')).toBeInTheDocument()
      expect(targetSquare).toHaveClass('is-move-animation-capture-to')

      await act(async () => {
        vi.advanceTimersByTime(1199)
      })

      expect(container.querySelector('.storm-capture-animation-layer')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /D4 Imperial queen capture destination/i }))
        .toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(1)
      })

      expect(container.querySelector('.storm-capture-animation-layer')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /D4 Pirate rook square/i })).not.toBeDisabled()
      expect(screen.queryByRole('button', { name: /Imperial queen/i })).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('animates quiet moves without laser or explosion effects', async () => {
    vi.useFakeTimers()
    const encounter = {
      id: 'test_quiet_move_animation',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 4, y: 4 } },
      ],
    }

    function Harness() {
      const [currentEncounter, setEncounter] = useState(encounter)

      return (
        <StormCommanderEncounterPage
          encounter={currentEncounter}
          onBack={() => {}}
          onNewEncounter={() => {}}
          onReturnToChess={() => {}}
          setEncounter={setEncounter}
        />
      )
    }

    try {
      const { container } = render(<Harness />)

      fireEvent.click(screen.getByRole('button', { name: /^Battle$/ }))
      fireEvent.click(screen.getByRole('button', { name: /Pirate rook square/i }))
      fireEvent.click(screen.getByRole('button', { name: /C4 empty legal destination/i }))

      expect(container.querySelector('.storm-capture-animation-layer')).toBeInTheDocument()
      expect(container.querySelector('.storm-capture-attacker')).toHaveAttribute(
        'data-faction',
        'pirate',
      )
      expect(container.querySelectorAll('.storm-capture-laser')).toHaveLength(0)
      expect(container.querySelectorAll('.storm-capture-hit-spark')).toHaveLength(0)
      expect(container.querySelector('.storm-capture-explosion')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /B4 Pirate rook square/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /C4 empty legal destination/i })).toBeDisabled()

      await act(async () => {
        vi.advanceTimersByTime(1200)
      })

      expect(container.querySelector('.storm-capture-animation-layer')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /C4 Pirate rook square/i })).not.toBeDisabled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('chooses the shortest rotation path when turning toward a move target', async () => {
    vi.useFakeTimers()
    const encounter = {
      id: 'test_shortest_move_rotation',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 4, y: 4 } },
      ],
    }

    function Harness() {
      const [currentEncounter, setEncounter] = useState(encounter)

      return (
        <StormCommanderEncounterPage
          encounter={currentEncounter}
          onBack={() => {}}
          onNewEncounter={() => {}}
          onReturnToChess={() => {}}
          pieceRotation="350deg"
          setEncounter={setEncounter}
        />
      )
    }

    try {
      const { container } = render(<Harness />)

      fireEvent.click(screen.getByRole('button', { name: /^Battle$/ }))
      fireEvent.click(screen.getByRole('button', { name: /Pirate rook square/i }))
      fireEvent.click(screen.getByRole('button', { name: /B5 empty legal destination/i }))

      const animationLayer = container.querySelector('.storm-capture-animation-layer')

      expect(animationLayer).toHaveStyle('--storm-move-start-angle: 350deg')
      expect(animationLayer).toHaveStyle('--storm-move-angle: 360deg')
    } finally {
      vi.useRealTimers()
    }
  })

  it('orients smaller legal movement triangles away from the selected ship', () => {
    const encounter = {
      id: 'test_legal_move_triangles',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 2, y: 2 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 4, y: 4 } },
      ],
    }

    render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /^Battle$/ }))
    fireEvent.click(screen.getByRole('button', { name: /C3 Pirate rook square/i }))

    expect(screen.getByRole('button', { name: /D3 empty legal destination/i }))
      .toHaveStyle('--storm-legal-move-angle: 90deg')
    expect(screen.getByRole('button', { name: /C4 empty legal destination/i }))
      .toHaveStyle('--storm-legal-move-angle: 0deg')
    expect(screen.getByRole('button', { name: /B3 empty legal destination/i }))
      .toHaveStyle('--storm-legal-move-angle: -90deg')
  })

  it('plays the same cosmetic animation before applying an enemy move', async () => {
    vi.useFakeTimers()
    const encounter = {
      id: 'test_enemy_move_animation',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'imperial',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_queen', faction: 'pirate', type: 'q', square: { x: 3, y: 1 } },
        { id: 'imperial_rook', faction: 'imperial', type: 'r', square: { x: 1, y: 1 } },
      ],
    }

    function Harness() {
      const [currentEncounter, setEncounter] = useState(encounter)

      return (
        <StormCommanderEncounterPage
          encounter={currentEncounter}
          onBack={() => {}}
          onNewEncounter={() => {}}
          onReturnToChess={() => {}}
          setEncounter={setEncounter}
        />
      )
    }

    try {
      const { container } = render(<Harness />)

      fireEvent.click(screen.getByRole('button', { name: /^Battle$/ }))

      await act(async () => {
        vi.advanceTimersByTime(2999)
      })

      expect(container.querySelector('.storm-capture-animation-layer')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /D4 Pirate queen square/i })).toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(1)
      })

      expect(container.querySelector('.storm-capture-animation-layer')).toBeInTheDocument()
      expect(container.querySelector('.storm-capture-attacker')).toHaveAttribute(
        'data-faction',
        'imperial',
      )
      expect(container.querySelectorAll('.storm-capture-laser')).toHaveLength(5)
      expect(screen.getByRole('button', { name: /B4 Imperial rook square/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /D4 Pirate queen square/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /D4 Pirate queen square/i })).toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(1200)
      })

      expect(container.querySelector('.storm-capture-animation-layer')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /D4 Imperial rook square/i })).not.toBeDisabled()
      expect(screen.queryByRole('button', { name: /Pirate queen/i })).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('cycles opponent comms while the enemy is thinking before moving', async () => {
    vi.useFakeTimers()
    const randomSpy = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.9)
    const encounter = {
      id: 'test_enemy_thinking_comms',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'imperial',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_queen', faction: 'pirate', type: 'q', square: { x: 3, y: 1 } },
        { id: 'imperial_rook', faction: 'imperial', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_bishop', faction: 'imperial', type: 'b', square: { x: 1, y: 3 } },
        { id: 'imperial_knight', faction: 'imperial', type: 'n', square: { x: 4, y: 4 } },
      ],
    }

    function Harness() {
      const [currentEncounter, setEncounter] = useState(encounter)

      return (
        <StormCommanderEncounterPage
          encounter={currentEncounter}
          onBack={() => {}}
          onNewEncounter={() => {}}
          onReturnToChess={() => {}}
          setEncounter={setEncounter}
        />
      )
    }

    try {
      const { container } = render(<Harness />)

      fireEvent.click(screen.getByRole('button', { name: /^Battle$/ }))

      expect(screen.getByRole('heading', { name: /^Imperial Rook Class$/i })).toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      expect(screen.getByRole('heading', { name: /^Imperial Bishop Class$/i })).toBeInTheDocument()
      expect(container.querySelector('.storm-capture-animation-layer')).not.toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(500)
      })

      expect(screen.getByRole('heading', { name: /^Imperial Knight Class$/i })).toBeInTheDocument()
      expect(container.querySelector('.storm-capture-animation-layer')).not.toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(1999)
      })

      expect(container.querySelector('.storm-capture-animation-layer')).not.toBeInTheDocument()

      await act(async () => {
        vi.advanceTimersByTime(1)
      })

      expect(container.querySelector('.storm-capture-animation-layer')).toBeInTheDocument()
    } finally {
      randomSpy.mockRestore()
      vi.useRealTimers()
    }
  })

  it('updates opponent comms when the player inspects an opponent ship', async () => {
    const user = userEvent.setup()
    const encounter = {
      id: 'test_opponent_comms',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_pawn', faction: 'imperial', type: 'p', square: { x: 3, y: 1 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 4, y: 4 } },
      ],
    }

    render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: /^Battle$/ }))

    const opponentComms = screen.getByRole('complementary', { name: /^Opponent comms$/ })

    expect(within(opponentComms).getByRole('heading', { name: /^Imperial Pawn Class$/ }))
      .toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Imperial queen square/i }))

    expect(within(opponentComms).getByRole('heading', { name: /^Imperial Queen Class$/ }))
      .toBeInTheDocument()
  })

  it('flashes the selected ship faction color inside its comms bar only', async () => {
    const user = userEvent.setup()
    const encounter = {
      id: 'test_selection_flash',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
      ],
    }

    const { container } = render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: /^Battle$/ }))
    const playerComms = screen.getByRole('complementary', { name: /^Player comms$/ })
    const opponentComms = screen.getByRole('complementary', { name: /^Opponent comms$/ })
    await user.click(screen.getByRole('button', { name: /Pirate rook square/i }))

    const pirateFlash = playerComms.querySelector('.storm-selection-flash')

    expect(pirateFlash).toBeInTheDocument()
    expect(pirateFlash).toHaveAttribute('data-faction', 'pirate')
    expect(pirateFlash).toHaveStyle('--storm-selection-flash-color: rgba(232, 108, 36, 0.9)')
    expect(opponentComms.querySelector('.storm-selection-flash')).not.toBeInTheDocument()
    expect(container.querySelector('.storm-encounter-play-area .storm-selection-flash'))
      .not.toBeInTheDocument()

    await waitForElementToBeRemoved(() => container.querySelector('.storm-selection-flash'), {
      timeout: 500,
    })

    await user.click(screen.getByRole('button', { name: /C5 empty square/i }))
    await user.click(screen.getByRole('button', { name: /Imperial queen square/i }))

    const imperialFlash = opponentComms.querySelector('.storm-selection-flash')

    expect(imperialFlash).toBeInTheDocument()
    expect(imperialFlash).toHaveAttribute('data-faction', 'imperial')
    expect(imperialFlash).toHaveStyle('--storm-selection-flash-color: rgba(213, 166, 14, 0.92)')
    expect(playerComms.querySelector('.storm-selection-flash')).not.toBeInTheDocument()
    expect(container.querySelector('.storm-encounter-play-area .storm-selection-flash'))
      .not.toBeInTheDocument()
  })

  it('moves player active selection to soft selection when scanning an enemy on the player turn', async () => {
    const user = userEvent.setup()
    const encounter = {
      id: 'test_soft_selection_rings',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_pawn', faction: 'imperial', type: 'p', square: { x: 3, y: 1 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 4, y: 4 } },
      ],
    }

    render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: /^Battle$/ }))

    const playerSquare = screen.getByRole('button', { name: /B4 Pirate rook square/i })
    const firstOpponentSquare = screen.getByRole('button', { name: /D4 Imperial pawn square/i })
    const secondOpponentSquare = screen.getByRole('button', { name: /E1 Imperial queen square/i })

    expect(playerSquare.querySelector('.storm-selection-ring')).toBeInTheDocument()
    expect(playerSquare).toHaveClass('is-player-soft-selected')
    expect(firstOpponentSquare).toHaveClass('is-opponent-soft-selected')
    expect(firstOpponentSquare).toHaveAttribute('data-faction', 'imperial')

    await user.click(playerSquare)

    expect(playerSquare).toHaveClass('is-selected')
    expect(playerSquare).not.toHaveClass('is-player-soft-selected')

    await user.click(secondOpponentSquare)

    expect(playerSquare).not.toHaveClass('is-selected')
    expect(playerSquare).toHaveClass('is-player-soft-selected')
    expect(firstOpponentSquare).not.toHaveClass('is-opponent-soft-selected')
    expect(secondOpponentSquare).not.toHaveClass('is-selected')
    expect(secondOpponentSquare).toHaveClass('is-opponent-soft-selected')
    expect(secondOpponentSquare).toHaveAttribute('data-faction', 'imperial')
  })

  it('shows player soft selection and enemy active selection during the enemy turn', async () => {
    vi.useFakeTimers()
    const encounter = {
      id: 'test_selection_ring_enemy_turn',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 4, y: 4 } },
      ],
    }

    function Harness() {
      const [currentEncounter, setEncounter] = useState(encounter)

      return (
        <StormCommanderEncounterPage
          encounter={currentEncounter}
          onBack={() => {}}
          onNewEncounter={() => {}}
          setEncounter={setEncounter}
        />
      )
    }

    try {
      render(<Harness />)

      fireEvent.click(screen.getByRole('button', { name: /^Battle$/ }))

      const playerStartSquare = screen.getByRole('button', { name: /B4 Pirate rook square/i })
      const opponentSquare = screen.getByRole('button', { name: /E1 Imperial queen square/i })

      expect(playerStartSquare).toHaveClass('is-player-soft-selected')
      expect(opponentSquare).toHaveClass('is-opponent-soft-selected')

      fireEvent.click(playerStartSquare)

      expect(playerStartSquare).toHaveClass('is-selected')
      expect(playerStartSquare).not.toHaveClass('is-player-soft-selected')
      expect(opponentSquare).toHaveClass('is-opponent-soft-selected')

      fireEvent.click(screen.getByRole('button', { name: /C4 empty legal destination/i }))

      expect(playerStartSquare).not.toHaveClass('is-selected')

      await act(async () => {
        vi.advanceTimersByTime(1200)
      })

      const playerMovedSquare = screen.getByRole('button', { name: /C4 Pirate rook square/i })

      expect(screen.getByRole('grid')).toHaveAttribute('data-current-faction', 'imperial')
      expect(playerMovedSquare).not.toHaveClass('is-selected')
      expect(playerMovedSquare).toHaveClass('is-player-soft-selected')
      expect(opponentSquare).toHaveClass('is-selected')
      expect(opponentSquare).not.toHaveClass('is-opponent-soft-selected')
      expect(opponentSquare).toHaveAttribute('data-faction', 'imperial')
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows a clear victory state when a Destroy Target capture ends the encounter', async () => {
    vi.useFakeTimers()
    const encounter = {
      id: 'test_destroy_target',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'destroyTarget',
        targetPieceId: 'imperial_queen',
        text: 'Destroy the Imperial queen.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
      ],
    }

    function Harness() {
      const [currentEncounter, setEncounter] = useState(encounter)

      return (
        <StormCommanderEncounterPage
          encounter={currentEncounter}
          onBack={() => {}}
          onNewEncounter={() => {}}
          onReturnToChess={() => {}}
          setEncounter={setEncounter}
        />
      )
    }

    try {
      render(<Harness />)

      fireEvent.click(screen.getByRole('button', { name: /^Battle$/ }))
      fireEvent.click(screen.getByRole('button', { name: /Pirate rook square/i }))
      fireEvent.click(screen.getByRole('button', { name: /Imperial queen capture destination/i }))

      await act(async () => {
        vi.advanceTimersByTime(1200)
      })

      const resultDialog = screen.getByRole('dialog', { name: /^Objective Succeeded$/ })

      expect(within(resultDialog).getByText('Victory: objective complete.')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('shows an objective result popup with a next mission action when the encounter is won', async () => {
    vi.useFakeTimers()
    const onNewEncounter = vi.fn()
    const encounter = {
      id: 'test_destroy_target_result',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'destroyTarget',
        targetPieceId: 'imperial_queen',
        text: 'Destroy the Imperial queen.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
      ],
    }

    function Harness() {
      const [currentEncounter, setEncounter] = useState(encounter)

      return (
        <StormCommanderEncounterPage
          encounter={currentEncounter}
          onBack={() => {}}
          onNewEncounter={onNewEncounter}
          onReturnToChess={() => {}}
          setEncounter={setEncounter}
        />
      )
    }

    try {
      render(<Harness />)

      fireEvent.click(screen.getByRole('button', { name: /^Battle$/ }))
      fireEvent.click(screen.getByRole('button', { name: /Pirate rook square/i }))
      fireEvent.click(screen.getByRole('button', { name: /Imperial queen capture destination/i }))

      await act(async () => {
        vi.advanceTimersByTime(1200)
      })

      const resultDialog = screen.getByRole('dialog', { name: /^Objective Succeeded$/ })

      expect(within(resultDialog).getByText('Victory: objective complete.')).toBeInTheDocument()

      fireEvent.click(within(resultDialog).getByRole('button', { name: /^Next Mission$/ }))

      expect(onNewEncounter).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('opens the objective result popup when an active encounter already satisfies the objective', async () => {
    const onNewEncounter = vi.fn()
    const encounter = {
      id: 'test_completed_active_result',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'destroyTarget',
        targetPieceId: 'imperial_queen',
        text: 'Destroy the Imperial queen.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_pawn', faction: 'imperial', type: 'p', square: { x: 3, y: 1 } },
      ],
    }

    function Harness() {
      const [currentEncounter, setEncounter] = useState(encounter)

      return (
        <StormCommanderEncounterPage
          encounter={currentEncounter}
          onBack={() => {}}
          onNewEncounter={onNewEncounter}
          onReturnToChess={() => {}}
          setEncounter={setEncounter}
        />
      )
    }

    render(<Harness />)

    const resultDialog = await screen.findByRole('dialog', { name: /^Objective Succeeded$/ })

    expect(within(resultDialog).getByText('Victory: objective complete.')).toBeInTheDocument()
  })

  it('shows an objective failed popup for lost encounters', async () => {
    const user = userEvent.setup()
    const onNewEncounter = vi.fn()
    const encounter = {
      id: 'test_lost_result',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'lost',
      outcome: 'All Pirate ships lost.',
      objective: {
        type: 'surviveTurns',
        turnsRequired: 4,
        turnsElapsed: 1,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
      ],
    }

    render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={onNewEncounter}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    const resultDialog = screen.getByRole('dialog', { name: /^Objective Failed$/ })

    expect(within(resultDialog).getByText('All Pirate ships lost.')).toBeInTheDocument()

    await user.click(within(resultDialog).getByRole('button', { name: /^Next Mission$/ }))

    expect(onNewEncounter).toHaveBeenCalledTimes(1)
  })

  it('does not mark empty squares as targets for non-target objectives', () => {
    const encounter = {
      id: 'test_escape_markers',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'escapeToSquare',
        extractionSquare: { x: 2, y: 4 },
        text: 'Move any Pirate ship to the extraction square.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'pirate_pawn', faction: 'pirate', type: 'p', square: { x: 2, y: 1 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
      ],
    }

    const { container } = render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    expect(container.querySelectorAll('.storm-encounter-square.is-target')).toHaveLength(0)
    expect(container.querySelectorAll('.storm-encounter-square.is-extraction')).toHaveLength(1)
  })

  it('mutes pawn diagonal capture pips in the movement icon', async () => {
    const user = userEvent.setup()
    const encounter = {
      id: 'test_pawn_movement_icon',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsToSurvive: 4,
        turnsSurvived: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_pawn', faction: 'pirate', type: 'p', square: { x: 2, y: 2 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 4, y: 2 } },
      ],
    }

    const { container } = render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: /^Battle$/ }))

    const pawnMovementIcon = screen.getByRole('img', {
      name: /^Moves one square vertically or horizontally\. Captures diagonally\.$/,
    })
    const captureHints = pawnMovementIcon.querySelectorAll(
      '.storm-movement-pattern-cell.is-capture-hint',
    )

    expect(within(screen.getByRole('complementary', { name: /^Player comms$/ }))
      .getByRole('heading', { name: /^Pirate Pawn Class$/ })).toBeInTheDocument()
    expect(captureHints).toHaveLength(4)
    expect(pawnMovementIcon.querySelectorAll('.storm-movement-pattern-cell.is-move'))
      .toHaveLength(8)
    captureHints.forEach((captureHint) => {
      expect(captureHint).toHaveClass('is-move')
    })
    expect(container.querySelectorAll('.storm-movement-pattern-cell:not(.is-move):not(.is-origin)'))
      .toHaveLength(0)
  })

  it('does not render circular last move markers on encounter squares', () => {
    const encounter = {
      id: 'test_last_move_marker_sides',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'surviveTurns',
        turnsToSurvive: 4,
        turnsSurvived: 0,
        text: 'Survive 4 turns until the jump drive charges.',
      },
      lastMove: {
        faction: 'rebel',
        from: { x: 3, y: 1 },
        pieceId: 'rebel_bishop',
        to: { x: 4, y: 2 },
      },
      pieces: [
        { id: 'pirate_pawn', faction: 'pirate', type: 'p', square: { x: 1, y: 3 } },
        { id: 'rebel_bishop', faction: 'rebel', type: 'b', square: { x: 4, y: 2 } },
      ],
    }

    const { container, rerender } = render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    expect(container.querySelector('.storm-encounter-square.is-last-move')).toBeNull()
    expect(container.querySelector('.storm-encounter-square.is-last-move-from')).toBeNull()
    expect(container.querySelector('.storm-encounter-square.is-last-move-to')).toBeNull()

    rerender(
      <StormCommanderEncounterPage
        encounter={{ ...encounter, currentFaction: 'imperial' }}
        onBack={() => {}}
        onNewEncounter={() => {}}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    expect(container.querySelector('.storm-encounter-square.is-last-move')).toBeNull()
    expect(container.querySelector('.storm-encounter-square.is-last-move-from')).toBeNull()
    expect(container.querySelector('.storm-encounter-square.is-last-move-to')).toBeNull()
    expect(screen.getByRole('button', { name: /^E3 Rebel bishop square$/ }))
      .toBeInTheDocument()
  })

  it('renders runtime faction rocket exhaust on encounter ships', () => {
    const encounter = {
      id: 'test_runtime_exhaust',
      title: 'Random Pirate Raid',
      board: { width: 5, height: 5 },
      factions: ['pirate', 'imperial'],
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      round: 1,
      intro: 'Commander, Imperial signatures just dropped out of slipspace.',
      capturedValueByPlayer: 0,
      status: 'active',
      outcome: null,
      objective: {
        type: 'destroyTarget',
        targetPieceId: 'imperial_queen',
        text: 'Destroy the Imperial queen.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'pirate_pawn', faction: 'pirate', type: 'p', square: { x: 2, y: 2 } },
        { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
      ],
    }

    const { container } = render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    const board = container.querySelector('.storm-encounter-board')

    expect(board.querySelectorAll('.storm-ship-piece')).toHaveLength(3)
    expect(board.querySelectorAll('.storm-ship-piece .storm-rocket-exhaust')).toHaveLength(7)
    expect(
      board.querySelectorAll('.storm-ship-piece[data-piece-type="p"] .storm-rocket-exhaust'),
    ).toHaveLength(1)
    expect(
      board.querySelector('.storm-ship-piece[data-piece-type="p"] .storm-rocket-exhaust-center'),
    ).toBeInTheDocument()
    expect(board.querySelector('.storm-ship-piece[data-faction="pirate"]')).toBeInTheDocument()
    expect(board.querySelector('.storm-ship-piece[data-faction="imperial"]')).toBeInTheDocument()
  })
})

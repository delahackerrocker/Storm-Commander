import { useState } from 'react'
import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'
import { StormCommanderEncounterPage } from '../storm-commander/components/StormCommanderEncounterPage'

describe('Storm Commander random encounter UI', () => {
  it('opens mission details as a dismissible briefing that can be restored', async () => {
    const user = userEvent.setup()
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    try {
      const { container } = render(<App />)

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
      expect(encounterStatusButton).toHaveTextContent('?')
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
      const { container } = render(<App />)

      await user.click(screen.getByRole('button', { name: /^Battle$/ }))

      const encounterStatusButton = screen.getByRole('button', {
        name: /Mission status\. Objective: .+\. Progress: .+\. Open mission briefing\./,
      })

      expect(encounterStatusButton).toHaveTextContent('?')
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

      expect(within(playerComms).getByRole('img', { name: /Pirate .* comms portrait/i }))
        .toBeInTheDocument()
      expect(within(opponentComms).getByRole('img', { name: /Imperial .* comms portrait/i }))
        .toBeInTheDocument()
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
      expect(within(playerComms).getByRole('heading', { name: /Pirate .* : [A-Z][1-9]/i }))
        .toBeInTheDocument()
    } finally {
      randomSpy.mockRestore()
    }
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

    expect(within(playerComms).getByRole('heading', { name: /^Pirate Queen : C4$/ }))
      .toBeInTheDocument()
  })

  it('keeps the last selected player ship in comms after the move selection clears', async () => {
    const user = userEvent.setup()
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

    render(<Harness />)

    await user.click(screen.getByRole('button', { name: /^Battle$/ }))
    await user.click(screen.getByRole('button', { name: /Pirate rook square/i }))
    await user.click(screen.getByRole('button', { name: /A4 empty legal destination/i }))

    const playerComms = screen.getByRole('complementary', { name: /^Player comms$/ })

    expect(within(playerComms).getByRole('heading', { name: /^Pirate Rook : A4$/ }))
      .toBeInTheDocument()
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

    expect(within(opponentComms).getByRole('heading', { name: /^Imperial Pawn : D4$/ }))
      .toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Imperial queen square/i }))

    expect(within(opponentComms).getByRole('heading', { name: /^Imperial Queen : E1$/ }))
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

  it('keeps soft rings on each comms ship and upgrades the player ship to active selection', async () => {
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
    expect(secondOpponentSquare).toHaveClass('is-opponent-soft-selected')
    expect(secondOpponentSquare).toHaveAttribute('data-faction', 'imperial')
  })

  it('shows a clear victory state when a Destroy Target capture ends the encounter', async () => {
    const user = userEvent.setup()
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

    render(<Harness />)

    await user.click(screen.getByRole('button', { name: /^Battle$/ }))
    await user.click(screen.getByRole('button', { name: /Pirate rook square/i }))
    await user.click(screen.getByRole('button', { name: /Imperial queen capture destination/i }))

    const resultDialog = screen.getByRole('dialog', { name: /^Objective Succeeded$/ })

    expect(within(resultDialog).getByText('Victory: objective complete.')).toBeInTheDocument()
  })

  it('shows an objective result popup with a next mission action when the encounter is won', async () => {
    const user = userEvent.setup()
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

    render(<Harness />)

    await user.click(screen.getByRole('button', { name: /^Battle$/ }))
    await user.click(screen.getByRole('button', { name: /Pirate rook square/i }))
    await user.click(screen.getByRole('button', { name: /Imperial queen capture destination/i }))

    const resultDialog = screen.getByRole('dialog', { name: /^Objective Succeeded$/ })

    expect(within(resultDialog).getByText('Victory: objective complete.')).toBeInTheDocument()

    await user.click(within(resultDialog).getByRole('button', { name: /^Next Mission$/ }))

    expect(onNewEncounter).toHaveBeenCalledTimes(1)
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
      .getByRole('heading', { name: /^Pirate Pawn : C3$/ })).toBeInTheDocument()
    expect(captureHints).toHaveLength(4)
    expect(pawnMovementIcon.querySelectorAll('.storm-movement-pattern-cell.is-move'))
      .toHaveLength(8)
    captureHints.forEach((captureHint) => {
      expect(captureHint).toHaveClass('is-move')
    })
    expect(container.querySelectorAll('.storm-movement-pattern-cell:not(.is-move):not(.is-origin)'))
      .toHaveLength(0)
  })

  it('separates last move origin and destination markers', () => {
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

    const { container } = render(
      <StormCommanderEncounterPage
        encounter={encounter}
        onBack={() => {}}
        onNewEncounter={() => {}}
        onReturnToChess={() => {}}
        setEncounter={() => {}}
      />,
    )

    const lastMoveFrom = container.querySelector('.storm-encounter-square.is-last-move-from')
    const lastMoveTo = container.querySelector('.storm-encounter-square.is-last-move-to')

    expect(lastMoveFrom).toHaveAccessibleName(/^D4 empty square$/)
    expect(lastMoveFrom).toHaveClass('is-last-move')
    expect(lastMoveTo).toHaveAccessibleName(/^E3 Rebel bishop square$/)
    expect(lastMoveTo).toHaveClass('is-last-move')
    expect(lastMoveTo).not.toHaveClass('is-last-move-from')
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

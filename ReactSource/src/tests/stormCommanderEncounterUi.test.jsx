import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
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
      const encounterStatus = screen.getByRole('complementary', { name: /^Encounter status$/ })

      expect(missionDialog).toBeInTheDocument()
      expect(
        within(missionDialog).getByRole('heading', { name: /^Random Pirate Raid$/ }),
      ).toBeInTheDocument()
      expect(within(missionDialog).getByText(/Objective:/)).toBeInTheDocument()
      expect(within(encounterStatus).getByRole('button', { name: /^Mission$/ }))
        .toBeInTheDocument()
      expect(container.querySelector('.storm-encounter-topbar .storm-mission-button'))
        .not.toBeInTheDocument()

      await user.click(within(missionDialog).getByRole('button', { name: /^Dismiss$/ }))

      expect(screen.queryByRole('dialog', { name: /^Random Pirate Raid$/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /^Random Pirate Raid$/ })).not.toBeInTheDocument()
      expect(within(encounterStatus).getByRole('button', { name: /^Mission$/ }))
        .toBeInTheDocument()
      expect(screen.getByRole('complementary', { name: /^Player comms$/ })).toBeInTheDocument()
      expect(screen.getByRole('complementary', { name: /^Opponent comms$/ })).toBeInTheDocument()

      await user.click(within(encounterStatus).getByRole('button', { name: /^Mission$/ }))

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

      await user.click(screen.getByRole('button', { name: /^Dismiss$/ }))

      const encounterStatus = screen.getByRole('complementary', { name: /^Encounter status$/ })

      expect(within(encounterStatus).getByRole('button', { name: /^Mission$/ }))
        .toBeInTheDocument()
      expect(container.querySelector('.storm-encounter-topbar .storm-mission-button'))
        .not.toBeInTheDocument()
      const newEncounterButton = screen.getByRole('button', { name: /^New Random Encounter$/ })
      expect(newEncounterButton).toHaveClass('storm-icon-button')
      expect(newEncounterButton).toHaveTextContent(/^$/)
      expect(container.querySelector('.storm-dice-icon')).toBeInTheDocument()
      expect(screen.getByText(/Objective/)).toBeInTheDocument()
      expect(container.querySelector('.storm-mission-summary-line')).not.toBeInTheDocument()
      expect(screen.getAllByTestId('storm-encounter-square').length).toBe(25)

      const playerComms = screen.getByRole('complementary', { name: /^Player comms$/ })
      const opponentComms = screen.getByRole('complementary', { name: /^Opponent comms$/ })

      expect(within(playerComms).getByRole('img', { name: /Pirate .* comms portrait/i }))
        .toBeInTheDocument()
      expect(within(opponentComms).getByRole('img', { name: /Imperial .* comms portrait/i }))
        .toBeInTheDocument()
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

      await user.click(screen.getAllByRole('button', { name: /Pirate .* square/i })[0])

      expect(within(playerComms).getByRole('img', { name: /Pirate .* comms portrait/i }))
        .toBeInTheDocument()
      expect(within(playerComms).getByRole('img', { name: /Moves/i })).toHaveClass(
        'storm-movement-pattern',
      )
      expect(within(playerComms).queryByText(/^Movement$/)).not.toBeInTheDocument()
      expect(within(playerComms).getByRole('heading', { name: /Pirate .* : [A-Z][1-9]/i }))
        .toBeInTheDocument()
    } finally {
      randomSpy.mockRestore()
    }
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

    await user.click(screen.getByRole('button', { name: /^Dismiss$/ }))

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

    await user.click(screen.getByRole('button', { name: /^Dismiss$/ }))
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

    await user.click(screen.getByRole('button', { name: /^Dismiss$/ }))

    const opponentComms = screen.getByRole('complementary', { name: /^Opponent comms$/ })

    expect(within(opponentComms).getByRole('heading', { name: /^Imperial Pawn : D4$/ }))
      .toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Imperial queen square/i }))

    expect(within(opponentComms).getByRole('heading', { name: /^Imperial Queen : E1$/ }))
      .toBeInTheDocument()
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

    await user.click(screen.getByRole('button', { name: /^Dismiss$/ }))

    const playerSquare = screen.getByRole('button', { name: /B4 Pirate rook square/i })
    const firstOpponentSquare = screen.getByRole('button', { name: /D4 Imperial pawn square/i })
    const secondOpponentSquare = screen.getByRole('button', { name: /E1 Imperial queen square/i })

    expect(playerSquare.querySelector('.storm-selection-ring')).toBeInTheDocument()
    expect(playerSquare).toHaveClass('is-player-soft-selected')
    expect(firstOpponentSquare).toHaveClass('is-opponent-soft-selected')

    await user.click(playerSquare)

    expect(playerSquare).toHaveClass('is-selected')
    expect(playerSquare).not.toHaveClass('is-player-soft-selected')

    await user.click(secondOpponentSquare)

    expect(playerSquare).not.toHaveClass('is-selected')
    expect(playerSquare).toHaveClass('is-player-soft-selected')
    expect(firstOpponentSquare).not.toHaveClass('is-opponent-soft-selected')
    expect(secondOpponentSquare).toHaveClass('is-opponent-soft-selected')
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

    await user.click(screen.getByRole('button', { name: /^Dismiss$/ }))
    await user.click(screen.getByRole('button', { name: /Pirate rook square/i }))
    await user.click(screen.getByRole('button', { name: /Imperial queen capture destination/i }))
    await user.click(screen.getByRole('button', { name: /^Mission$/ }))

    const missionDialog = screen.getByRole('dialog', { name: /^Random Pirate Raid$/ })

    expect(within(missionDialog).getByText('Victory')).toBeInTheDocument()
    expect(within(missionDialog).getByText('Victory: objective complete.')).toBeInTheDocument()
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

    await user.click(screen.getByRole('button', { name: /^Dismiss$/ }))
    await user.click(screen.getByRole('button', { name: /Pirate rook square/i }))
    await user.click(screen.getByRole('button', { name: /Imperial queen capture destination/i }))

    const resultDialog = screen.getByRole('dialog', { name: /^Objective Succeeded$/ })

    expect(within(resultDialog).getByText('Victory: objective complete.')).toBeInTheDocument()

    await user.click(within(resultDialog).getByRole('button', { name: /^Next Mission$/ }))

    expect(onNewEncounter).toHaveBeenCalledTimes(1)
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

    await user.click(screen.getByRole('button', { name: /^Dismiss$/ }))

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

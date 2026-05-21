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
      render(<App />)

      const missionDialog = screen.getByRole('dialog', { name: /^Random Pirate Raid$/ })

      expect(missionDialog).toBeInTheDocument()
      expect(
        within(missionDialog).getByRole('heading', { name: /^Random Pirate Raid$/ }),
      ).toBeInTheDocument()
      expect(within(missionDialog).getByText(/Objective:/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Mission$/ })).toBeInTheDocument()

      await user.click(within(missionDialog).getByRole('button', { name: /^Dismiss$/ }))

      expect(screen.queryByRole('dialog', { name: /^Random Pirate Raid$/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /^Random Pirate Raid$/ })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^Mission$/ })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /^Cockpit$/ })).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /^Mission$/ }))

      expect(screen.getByRole('dialog', { name: /^Random Pirate Raid$/ })).toBeInTheDocument()
    } finally {
      randomSpy.mockRestore()
    }
  })

  it('generates an encounter and shows the selected Pirate cockpit panel', async () => {
    const user = userEvent.setup()
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    try {
      render(<App />)

      await user.click(screen.getByRole('button', { name: /^Dismiss$/ }))

      expect(screen.getByRole('button', { name: /^Mission$/ })).toBeInTheDocument()
      expect(screen.getByText(/Objective/)).toBeInTheDocument()
      expect(screen.getAllByTestId('storm-encounter-square').length).toBe(25)

      await user.click(screen.getAllByRole('button', { name: /Pirate .* square/i })[0])

      expect(screen.getByRole('img', { name: /Pirate .* cockpit placeholder/i })).toBeInTheDocument()
      expect(screen.getByText(/Movement:/)).toBeInTheDocument()
      expect(screen.getByText(/Pirate .* Pilot/i)).toBeInTheDocument()
    } finally {
      randomSpy.mockRestore()
    }
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

    expect(container.querySelectorAll('.storm-ship-piece')).toHaveLength(3)
    expect(container.querySelectorAll('.storm-ship-piece .storm-rocket-exhaust')).toHaveLength(7)
    expect(
      container.querySelectorAll('.storm-ship-piece[data-piece-type="p"] .storm-rocket-exhaust'),
    ).toHaveLength(1)
    expect(
      container.querySelector('.storm-ship-piece[data-piece-type="p"] .storm-rocket-exhaust-center'),
    ).toBeInTheDocument()
    expect(container.querySelector('.storm-ship-piece[data-faction="pirate"]')).toBeInTheDocument()
    expect(container.querySelector('.storm-ship-piece[data-faction="imperial"]')).toBeInTheDocument()
  })
})

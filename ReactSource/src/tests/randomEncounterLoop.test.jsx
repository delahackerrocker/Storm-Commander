import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { generateRandomEncounter } from '../storm-commander/encounter/generateRandomEncounter'

vi.mock('../storm-commander/encounter/generateRandomEncounter', () => ({
  generateRandomEncounter: vi.fn(),
}))

function createEncounter(overrides = {}) {
  return {
    id: 'test_encounter',
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
    ...overrides,
  }
}

describe('random encounter loop', () => {
  beforeEach(() => {
    generateRandomEncounter.mockReset()
  })

  it('starts another random encounter from the completion dialog instead of returning to the Start Menu', async () => {
    const user = userEvent.setup()
    const completedEncounter = createEncounter({
      id: 'completed_encounter',
      outcome: 'Victory: objective complete.',
      status: 'won',
    })
    const nextEncounter = createEncounter({
      id: 'next_encounter',
      title: 'Fresh Pirate Raid',
    })

    generateRandomEncounter
      .mockReturnValueOnce(completedEncounter)
      .mockReturnValueOnce(nextEncounter)

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Random Encounter$/ }))

    const resultDialog = screen.getByRole('dialog', { name: /^Objective Succeeded$/ })
    expect(within(resultDialog).getByText('Victory: objective complete.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Back$/ })).not.toBeInTheDocument()

    await user.click(within(resultDialog).getByRole('button', { name: /^Next Mission$/ }))

    expect(generateRandomEncounter).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('main', { name: /^Start menu$/ })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: /^Fresh Pirate Raid$/ })).toBeInTheDocument()
    expect(screen.getAllByTestId('storm-encounter-square')).toHaveLength(25)
    expect(screen.queryByRole('button', { name: /^Debug$/ })).not.toBeInTheDocument()
  })
})

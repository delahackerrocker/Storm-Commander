import { describe, expect, it } from 'vitest'
import { generateRandomEncounter } from '../storm-commander/encounter/generateRandomEncounter'
import { STORM_COMMANDER_BOARD_SIZES } from '../storm-commander/tactics/encounterConstants'

function squareKey(square) {
  return `${square.x},${square.y}`
}

describe('Storm Commander random encounter generator', () => {
  it('returns a portable encounter with valid board dimensions and a Pirate player faction', () => {
    const encounter = generateRandomEncounter(() => 0)

    expect(STORM_COMMANDER_BOARD_SIZES).toContain(encounter.board.width)
    expect(encounter.board.width).toBe(encounter.board.height)
    expect(encounter.playerFaction).toBe('pirate')
    expect(encounter.factions[0]).toBe('pirate')
    expect(encounter.factions).toHaveLength(2)
    expect(encounter.factions.slice(1)).not.toContain('pirate')
    expect(encounter.turnOrder).toEqual(encounter.factions)
    expect(encounter.currentFaction).toBe('pirate')
    expect(encounter.objective).toBeTruthy()
    expect(encounter.objective.text).toEqual(expect.any(String))
    expect(encounter.status).toBe('active')
  })

  it('can generate crowded encounters with three enemy factions', () => {
    const encounter = generateRandomEncounter(() => 0.99)

    expect(encounter.factions).toHaveLength(4)
    expect(encounter.factions[0]).toBe('pirate')
    expect(encounter.factions.slice(1).sort()).toEqual(['imperial', 'rebel', 'robocorp'])
  })

  it('places every generated piece inside the board without overlap', () => {
    const encounter = generateRandomEncounter(() => 0.42)
    const occupiedSquares = new Set()

    for (const piece of encounter.pieces) {
      expect(piece.square.x).toBeGreaterThanOrEqual(0)
      expect(piece.square.x).toBeLessThan(encounter.board.width)
      expect(piece.square.y).toBeGreaterThanOrEqual(0)
      expect(piece.square.y).toBeLessThan(encounter.board.height)
      expect(occupiedSquares.has(squareKey(piece.square))).toBe(false)
      occupiedSquares.add(squareKey(piece.square))
    }
  })
})

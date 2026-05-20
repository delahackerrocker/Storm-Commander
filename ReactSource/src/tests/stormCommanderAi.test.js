import { describe, expect, it } from 'vitest'
import { selectSloppyAggressiveMove } from '../storm-commander/encounter/sloppyAggressiveAi'

describe('Storm Commander Sloppy Aggressive AI', () => {
  it('prefers the highest-value capture available', () => {
    const encounter = {
      board: { width: 5, height: 5 },
      currentFaction: 'imperial',
      status: 'active',
      pieces: [
        { id: 'imperial_rook', faction: 'imperial', type: 'r', square: { x: 2, y: 2 } },
        { id: 'pirate_pawn', faction: 'pirate', type: 'p', square: { x: 2, y: 1 } },
        { id: 'pirate_queen', faction: 'pirate', type: 'q', square: { x: 4, y: 2 } },
      ],
    }

    const move = selectSloppyAggressiveMove(encounter, 'imperial', () => 0)

    expect(move.pieceId).toBe('imperial_rook')
    expect(move.to).toEqual({ x: 4, y: 2 })
    expect(move.capturedPieceId).toBe('pirate_queen')
    expect(move.capturedValue).toBe(4)
  })
})

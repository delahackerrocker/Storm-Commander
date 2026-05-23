import { Chess } from 'chess.js'
import { describe, expect, it } from 'vitest'
import { getLegalEncounterMoves } from '../storm-commander/tactics/encounterMovement'

function createEncounter(pieces) {
  return {
    board: { width: 5, height: 5 },
    currentFaction: 'pirate',
    pieces,
    status: 'active',
  }
}

function destinations(moves) {
  return moves.map((move) => `${move.to.x},${move.to.y}`).sort()
}

describe('Storm Commander encounter movement', () => {
  it('lets pawns move one square vertically or horizontally without capturing', () => {
    const encounter = createEncounter([
      { id: 'pirate_pawn', faction: 'pirate', type: 'p', square: { x: 2, y: 2 } },
    ])

    expect(destinations(getLegalEncounterMoves(encounter, 'pirate_pawn'))).toEqual([
      '1,2',
      '2,1',
      '2,3',
      '3,2',
    ])
  })

  it('lets pawns capture diagonally forward or backward but not horizontally', () => {
    const encounter = createEncounter([
      { id: 'pirate_pawn', faction: 'pirate', type: 'p', square: { x: 2, y: 2 } },
      { id: 'imperial_left', faction: 'imperial', type: 'n', square: { x: 1, y: 2 } },
      { id: 'imperial_right', faction: 'imperial', type: 'n', square: { x: 3, y: 2 } },
      { id: 'imperial_a', faction: 'imperial', type: 'q', square: { x: 1, y: 1 } },
      { id: 'imperial_b', faction: 'imperial', type: 'r', square: { x: 3, y: 3 } },
      { id: 'pirate_blocker', faction: 'pirate', type: 'b', square: { x: 1, y: 3 } },
    ])
    const captureMoves = getLegalEncounterMoves(encounter, 'pirate_pawn')
      .filter((move) => move.capturedPieceId)

    expect(destinations(captureMoves)).toEqual(['1,1', '3,3'])
  })

  it('keeps Standard Chess pawn behavior under chess.js unchanged', () => {
    const game = new Chess()

    expect(game.moves({ square: 'e2' })).toEqual(['e3', 'e4'])
    expect(game.moves({ square: 'e2' })).not.toContain('e1')
  })

  it('lets sliding pieces stop at blockers and capture the first hostile piece', () => {
    const encounter = createEncounter([
      { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 2, y: 2 } },
      { id: 'pirate_blocker', faction: 'pirate', type: 'p', square: { x: 2, y: 0 } },
      { id: 'imperial_target', faction: 'imperial', type: 'q', square: { x: 4, y: 2 } },
      { id: 'imperial_hidden', faction: 'imperial', type: 'q', square: { x: 4, y: 4 } },
    ])

    expect(destinations(getLegalEncounterMoves(encounter, 'pirate_rook'))).toEqual([
      '0,2',
      '1,2',
      '2,1',
      '2,3',
      '2,4',
      '3,2',
      '4,2',
    ])
  })
})

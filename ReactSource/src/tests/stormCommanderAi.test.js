import { describe, expect, it } from 'vitest'
import { selectSloppyAggressiveMove } from '../storm-commander/encounter/sloppyAggressiveAi'
import { applyEncounterMove } from '../storm-commander/objectives/encounterObjectives'
import { getAllLegalEncounterMoves } from '../storm-commander/tactics/encounterMovement'

function position(pieces, objective = { type: 'captureValue', valueRequired: 5 }) {
  return {
    board: { width: 5, height: 5 }, currentFaction: 'imperial', playerFaction: 'pirate',
    turnOrder: ['pirate', 'imperial'], status: 'active', capturedValueByPlayer: 0,
    objective,
    pieces: pieces.map(([id, faction, type, x, y]) => ({ id, faction, type, square: { x, y } })),
  }
}

describe('Storm Commander Sloppy Aggressive AI', () => {
  it('prefers the highest-value capture available', () => {
    const encounter = {
      board: { width: 5, height: 5 },
      currentFaction: 'imperial',
      playerFaction: 'pirate',
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

  it('passes up a pawn when the queen would be immediately lost in return', () => {
    const encounter = position([
      ['queen', 'imperial', 'q', 0, 0],
      ['bait', 'pirate', 'p', 0, 2],
      ['defender', 'pirate', 'n', 1, 4],
    ])
    const snapshot = structuredClone(encounter)
    const move = selectSloppyAggressiveMove(encounter, 'imperial', () => 0)
    expect(move.capturedPieceId).not.toBe('bait')
    const next = applyEncounterMove(encounter, move)
    expect(getAllLegalEncounterMoves(next, 'pirate').some(reply => reply.capturedPieceId === 'queen')).toBe(false)
    expect(encounter).toEqual(snapshot)
  })

  it('still takes a profitable exchange even when its ship can be recaptured', () => {
    const encounter = position([
      ['rook', 'imperial', 'r', 0, 0],
      ['escort', 'imperial', 'p', 4, 4],
      ['prize', 'pirate', 'q', 0, 2],
      ['defender', 'pirate', 'n', 1, 4],
    ])
    expect(selectSloppyAggressiveMove(encounter, 'imperial', () => 0).capturedPieceId).toBe('prize')
  })

  it('blocks an immediate extraction win when it can', () => {
    const encounter = position([
      ['guard', 'imperial', 'r', 2, 4],
      ['escort', 'imperial', 'p', 4, 4],
      ['runner', 'pirate', 'r', 0, 2],
    ], { type: 'escapeToSquare', extractionSquare: { x: 4, y: 2 } })
    const next = applyEncounterMove(encounter, selectSloppyAggressiveMove(encounter, 'imperial', () => 0))
    expect(getAllLegalEncounterMoves(next, 'pirate').some(reply => applyEncounterMove(next, reply).status === 'won')).toBe(false)
  })

  it('moves a marked ship out of immediate capture when possible', () => {
    const encounter = position([
      ['target', 'imperial', 'q', 0, 0],
      ['escort', 'imperial', 'p', 4, 4],
      ['hunter', 'pirate', 'r', 0, 3],
      ['backup', 'pirate', 'p', 3, 4],
    ], { type: 'destroyTarget', targetPieceId: 'target' })
    const next = applyEncounterMove(encounter, selectSloppyAggressiveMove(encounter, 'imperial', () => 0))
    expect(getAllLegalEncounterMoves(next, 'pirate').some(reply => applyEncounterMove(next, reply).status === 'won')).toBe(false)
  })

  it('varies equally safe choices and returns no move after the match ends', () => {
    const encounter = position([
      ['ship', 'imperial', 'p', 2, 2],
      ['pirate', 'pirate', 'p', 0, 0],
    ])
    expect(selectSloppyAggressiveMove(encounter, 'imperial', () => 0)).not.toEqual(selectSloppyAggressiveMove(encounter, 'imperial', () => 0.99))
    expect(selectSloppyAggressiveMove({ ...encounter, status: 'won' }, 'imperial')).toBeNull()
  })
})

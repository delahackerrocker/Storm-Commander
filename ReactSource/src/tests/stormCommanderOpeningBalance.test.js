import { describe, expect, it } from 'vitest'
import { balanceOpeningObjective } from '../storm-commander/encounter/balanceOpeningObjective'
import { generateRandomEncounter } from '../storm-commander/encounter/generateRandomEncounter'
import { getAllLegalEncounterMoves } from '../storm-commander/tactics/encounterMovement'
import { applyEncounterMove, evaluateEncounterStatus } from '../storm-commander/objectives/encounterObjectives'
import { STORM_COMMANDER_PIECE_VALUES } from '../storm-commander/tactics/encounterConstants'

function randomSource(seed) {
  let state = seed
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function assertSafeOpening(encounter) {
  expect(evaluateEncounterStatus(encounter).status).toBe('active')
  const moves = getAllLegalEncounterMoves(encounter, 'pirate')
  expect(moves.length).toBeGreaterThan(0)
  for (const move of moves) {
    expect(applyEncounterMove(encounter, move).status).not.toBe('won')
  }
  const squares = encounter.pieces.map(piece => `${piece.square.x},${piece.square.y}`)
  expect(new Set(squares).size).toBe(squares.length)
  if (encounter.objective.type === 'escapeToSquare') {
    const { x, y } = encounter.objective.extractionSquare
    expect(squares).not.toContain(`${x},${y}`)
    expect(x === 0 || y === 0 || x === encounter.board.width - 1 || y === encounter.board.height - 1).toBe(true)
  }
}

function fixture(objective) {
  return {
    board: { width: 5, height: 5 },
    playerFaction: 'pirate', currentFaction: 'pirate',
    turnOrder: ['pirate', 'imperial'], status: 'active', capturedValueByPlayer: 0,
    objective,
    pieces: [
      { id: 'player', faction: 'pirate', type: 'r', square: { x: 0, y: 0 } },
      { id: 'target', faction: 'imperial', type: 'q', square: { x: 0, y: 3 } },
      { id: 'escort', faction: 'imperial', type: 'p', square: { x: 4, y: 4 } },
    ],
  }
}

describe('random encounter opening balance', () => {
  it('relocates an immediately capturable target without changing its identity or other ships', () => {
    const original = fixture({ type: 'destroyTarget', targetPieceId: 'target' })
    const snapshot = structuredClone(original)
    const balanced = balanceOpeningObjective(original, () => 0)
    assertSafeOpening(balanced)
    expect(balanced.objective).toEqual(original.objective)
    expect(balanced.pieces.filter(piece => piece.id !== 'target')).toEqual(original.pieces.filter(piece => piece.id !== 'target'))
    expect(original).toEqual(snapshot)
  })

  it.each([{ x: 4, y: 0 }, { x: 0, y: 0 }, { x: 4, y: 4 }])('relocates reachable or occupied extraction at %j', square => {
    const original = fixture({ type: 'escapeToSquare', extractionSquare: square })
    const balanced = balanceOpeningObjective(original, () => 0.99)
    assertSafeOpening(balanced)
    expect(balanced.pieces).toEqual(original.pieces)
  })

  it('leaves an already safe opening unchanged', () => {
    const original = fixture({ type: 'escapeToSquare', extractionSquare: { x: 4, y: 2 } })
    expect(balanceOpeningObjective(original)).toBe(original)
  })

  it('redeploys a fleet when every edge is occupied, even with constant randomness', () => {
    const original = fixture({ type: 'escapeToSquare', extractionSquare: { x: 0, y: 0 } })
    const edges = Array.from({ length: 25 }, (_, index) => ({ x: index % 5, y: Math.floor(index / 5) }))
      .filter(({ x, y }) => x === 0 || y === 0 || x === 4 || y === 4)
    original.pieces = ['q', 'r', 'n', 'b', 'p', 'p', 'q', 'r', 'n', 'b', 'p', 'p', 'p', 'p', 'p', 'p']
      .map((type, index) => ({ id: `ship_${index}`, faction: index < 6 ? 'pirate' : 'imperial', type, square: edges[index] }))
    const balanced = balanceOpeningObjective(original, () => 0)
    assertSafeOpening(balanced)
    expect(balanced.pieces).not.toEqual(original.pieces)
    for (const piece of original.pieces) {
      expect(balanced.pieces).toContainEqual(expect.objectContaining({ id: piece.id, faction: piece.faction, type: piece.type }))
    }
  })

  it('keeps all objectives fair across 2,000 reproducible random encounters', () => {
    const seen = new Set()
    const random = randomSource(20260928)
    for (let index = 0; index < 2000; index++) {
      const encounter = generateRandomEncounter(random)
      seen.add(`${encounter.board.width}:${encounter.objective.type}`)
      assertSafeOpening(encounter)
      if (encounter.objective.type === 'captureValue') {
        const values = encounter.pieces.filter(piece => piece.faction !== 'pirate').map(piece => STORM_COMMANDER_PIECE_VALUES[piece.type])
        const total = values.reduce((sum, value) => sum + value, 0)
        expect(encounter.objective.valueRequired).toBeGreaterThan(Math.max(...values))
        expect(encounter.objective.valueRequired).toBeGreaterThanOrEqual(Math.ceil(total * 0.75))
        expect(encounter.objective.valueRequired).toBeLessThanOrEqual(total)
      }
    }
    expect(seen.size).toBe(12)
  })
})

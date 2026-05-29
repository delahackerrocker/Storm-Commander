import { describe, expect, it } from 'vitest'
import {
  applyEncounterMove,
  evaluateEncounterStatus,
} from '../storm-commander/objectives/encounterObjectives'

describe('Storm Commander encounter objectives', () => {
  it('wins Destroy Target when the marked enemy piece is captured', () => {
    const encounter = {
      board: { width: 5, height: 5 },
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      capturedValueByPlayer: 0,
      status: 'active',
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

    const nextEncounter = applyEncounterMove(encounter, {
      pieceId: 'pirate_rook',
      from: { x: 1, y: 1 },
      to: { x: 3, y: 1 },
      capturedPieceId: 'imperial_queen',
      capturedValue: 4,
    })

    expect(nextEncounter.status).toBe('won')
    expect(nextEncounter.outcome).toBe('Victory: objective complete.')
  })

  it('wins Capture Value after the player captures enough enemy value', () => {
    const encounter = {
      playerFaction: 'pirate',
      capturedValueByPlayer: 3,
      status: 'active',
      objective: {
        type: 'captureValue',
        valueRequired: 5,
        text: 'Capture 5 value worth of enemy ships.',
      },
      pieces: [
        { id: 'pirate_knight', faction: 'pirate', type: 'n', square: { x: 0, y: 0 } },
        { id: 'imperial_rook', faction: 'imperial', type: 'r', square: { x: 1, y: 2 } },
      ],
    }

    const nextEncounter = applyEncounterMove(encounter, {
      pieceId: 'pirate_knight',
      from: { x: 0, y: 0 },
      to: { x: 1, y: 2 },
      capturedPieceId: 'imperial_rook',
      capturedValue: 2,
    })

    expect(nextEncounter.capturedValueByPlayer).toBe(5)
    expect(nextEncounter.status).toBe('won')
  })

  it('wins Escape To Square when any Pirate piece reaches extraction', () => {
    const encounter = {
      playerFaction: 'pirate',
      capturedValueByPlayer: 0,
      status: 'active',
      objective: {
        type: 'escapeToSquare',
        extractionSquare: { x: 4, y: 0 },
        text: 'Move any Pirate ship to the extraction square.',
      },
      pieces: [
        { id: 'pirate_knight', faction: 'pirate', type: 'n', square: { x: 4, y: 0 } },
      ],
    }

    expect(evaluateEncounterStatus(encounter).status).toBe('won')
  })

  it('wins when the player destroys every enemy piece even if the objective is incomplete', () => {
    const encounter = {
      board: { width: 5, height: 5 },
      playerFaction: 'pirate',
      turnOrder: ['pirate', 'imperial'],
      currentFaction: 'pirate',
      capturedValueByPlayer: 0,
      status: 'active',
      objective: {
        type: 'surviveTurns',
        turnsRequired: 5,
        turnsElapsed: 0,
        text: 'Survive 5 turns until the jump drive charges.',
      },
      pieces: [
        { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
        { id: 'imperial_pawn', faction: 'imperial', type: 'p', square: { x: 1, y: 3 } },
      ],
    }

    const nextEncounter = applyEncounterMove(encounter, {
      pieceId: 'pirate_rook',
      from: { x: 1, y: 1 },
      to: { x: 1, y: 3 },
      capturedPieceId: 'imperial_pawn',
      capturedValue: 1,
    })

    expect(nextEncounter.status).toBe('won')
    expect(nextEncounter.outcome).toBe('Victory: enemy fleet destroyed.')
  })
})

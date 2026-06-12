import { describe, expect, it } from 'vitest'
import {
  STORM_COMMANDER_BRIEFING_CHATTER_VARIATIONS,
  buildPilotChatterSequence,
} from '../storm-commander/comms/pilotChatter'

const BASE_ENCOUNTER = {
  id: 'test_chatter_destroy',
  title: 'Random Pirate Raid',
  board: { width: 5, height: 5 },
  factions: ['pirate', 'imperial'],
  playerFaction: 'pirate',
  capturedValueByPlayer: 0,
  objective: {
    type: 'destroyTarget',
    targetPieceId: 'imperial_queen',
    text: 'Destroy the Imperial queen.',
  },
  pieces: [
    { id: 'pirate_rook', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
    { id: 'pirate_pawn', faction: 'pirate', type: 'p', square: { x: 0, y: 4 } },
    { id: 'imperial_queen', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
    { id: 'imperial_pawn', faction: 'imperial', type: 'p', square: { x: 4, y: 4 } },
  ],
}

describe('Storm Commander pilot chatter', () => {
  it('provides several briefing variations for every objective type', () => {
    expect(Object.keys(STORM_COMMANDER_BRIEFING_CHATTER_VARIATIONS).sort()).toEqual([
      'captureValue',
      'destroyTarget',
      'escapeToSquare',
      'surviveTurns',
    ])

    for (const variations of Object.values(STORM_COMMANDER_BRIEFING_CHATTER_VARIATIONS)) {
      expect(variations.length).toBeGreaterThanOrEqual(3)
      expect(variations.every((variation) => variation.length >= 4)).toBe(true)
    }
  })

  it('builds a deterministic back-and-forth sequence that restates the objective', () => {
    const firstSequence = buildPilotChatterSequence(BASE_ENCOUNTER)
    const secondSequence = buildPilotChatterSequence(BASE_ENCOUNTER)

    expect(firstSequence).toEqual(secondSequence)
    expect(firstSequence).toHaveLength(4)
    expect(firstSequence.map((line) => line.side)).toEqual([
      'player',
      'opponent',
      'player',
      'opponent',
    ])
    expect(firstSequence.map((line) => line.pieceId)).toEqual([
      'pirate_rook',
      'imperial_queen',
      'pirate_rook',
      'imperial_queen',
    ])
    expect(firstSequence.some((line) => line.text.includes('Destroy the Imperial queen.')))
      .toBe(true)
  })

  it('fills objective-specific details for extraction, survival, and capture value chatter', () => {
    const escapeSequence = buildPilotChatterSequence({
      ...BASE_ENCOUNTER,
      id: 'test_chatter_escape',
      objective: {
        type: 'escapeToSquare',
        extractionSquare: { x: 4, y: 4 },
        text: 'Move any Pirate ship to the extraction square.',
      },
    })
    const surviveSequence = buildPilotChatterSequence({
      ...BASE_ENCOUNTER,
      id: 'test_chatter_survive',
      objective: {
        type: 'surviveTurns',
        turnsRequired: 6,
        turnsElapsed: 0,
        text: 'Survive 6 turns until the jump drive charges.',
      },
    })
    const captureSequence = buildPilotChatterSequence({
      ...BASE_ENCOUNTER,
      id: 'test_chatter_capture',
      capturedValueByPlayer: 1,
      objective: {
        type: 'captureValue',
        valueRequired: 5,
        text: 'Capture enough enemy ships to break their formation.',
      },
    })

    expect(escapeSequence.some((line) => line.text.includes('E1'))).toBe(true)
    expect(surviveSequence.some((line) => line.text.includes('6 turns'))).toBe(true)
    expect(captureSequence.some((line) => line.text.includes('5 value'))).toBe(true)
  })
})

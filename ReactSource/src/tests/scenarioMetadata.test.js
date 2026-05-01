import { describe, expect, it } from 'vitest'
import {
  computeMaterialSummaryFromFen,
  computePieceCountFromFen,
  getFullmoveNumberFromFen,
} from '../chess/scenarios/scenarioMetadata'

describe('scenarioMetadata', () => {
  const fen = '4k3/P7/8/8/8/8/7p/4K3 w - - 0 31'

  it('computes piece count from FEN', () => {
    expect(computePieceCountFromFen(fen)).toBe(4)
  })

  it('computes fullmove number from FEN', () => {
    expect(getFullmoveNumberFromFen(fen)).toBe(31)
  })

  it('computes material summary from FEN', () => {
    expect(computeMaterialSummaryFromFen(fen)).toEqual({
      white: { pawns: 1, knights: 0, bishops: 0, rooks: 0, queens: 0, king: 1 },
      black: { pawns: 1, knights: 0, bishops: 0, rooks: 0, queens: 0, king: 1 },
    })
  })
})

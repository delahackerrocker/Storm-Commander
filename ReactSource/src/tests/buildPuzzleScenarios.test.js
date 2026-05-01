import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  normalizeLichessRow,
  parseCsvLine,
  rowFromCsvLine,
  scenarioMatchesOptions,
} from '../../scripts/buildPuzzleScenarios.mjs'

describe('buildPuzzleScenarios importer helpers', () => {
  it('parses a Lichess-style promotion row and applies the setup move', () => {
    const [headerLine, puzzleLine] = readFileSync(
      'src/tests/fixtures/lichessPuzzleFixture.csv',
      'utf8',
    )
      .trim()
      .split(/\r?\n/)
    const headers = parseCsvLine(headerLine)
    const row = rowFromCsvLine(headers, puzzleLine)
    const scenario = normalizeLichessRow(row)

    expect(scenario.source).toBe('lichess')
    expect(scenario.sourcePuzzleId).toBe('fixturePromotion')
    expect(scenario.setupMove).toBe('e8e7')
    expect(scenario.solutionMoves).toEqual(['a7a8q'])
    expect(scenario.themes).toContain('promotion')
    expect(scenario.playableFen).not.toBe(scenario.originalFen)
    expect(
      scenarioMatchesOptions(scenario, {
        minRating: 800,
        maxRating: 1800,
        minPopularity: 70,
        minFullmove: 15,
        maxPieceCount: 28,
        themes: ['promotion'],
      }),
    ).toBe(true)
  })
})

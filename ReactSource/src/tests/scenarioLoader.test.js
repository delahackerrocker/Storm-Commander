import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { selectComputerMove } from '../chess/selectComputerMove'
import {
  getCuratedScenarios,
  getMissingScenarioFields,
  loadScenarioIntoChess,
} from '../chess/scenarios/scenarioLoader'

function containsUndefined(value) {
  if (value === undefined) {
    return true
  }

  if (Array.isArray(value)) {
    return value.some(containsUndefined)
  }

  if (value && typeof value === 'object') {
    return Object.values(value).some(containsUndefined)
  }

  return false
}

function isLegalMove(game, selectedMove) {
  return game.moves({ verbose: true }).some((move) => {
    return (
      move.from === selectedMove.from &&
      move.to === selectedMove.to &&
      (move.promotion || null) === (selectedMove.promotion || null)
    )
  })
}

describe('scenarioLoader', () => {
  const scenarios = getCuratedScenarios()

  it('loads curated scenarios as valid JSON with the required seed coverage', () => {
    expect(scenarios).toHaveLength(12)
    expect(scenarios.filter((scenario) => scenario.themes.includes('promotion'))).toHaveLength(2)
    expect(scenarios.filter((scenario) => scenario.themes.includes('endgame')).length).toBeGreaterThanOrEqual(2)
    expect(scenarios.filter((scenario) => scenario.themes.includes('middlegame')).length).toBeGreaterThanOrEqual(2)
    expect(scenarios.filter((scenario) => scenario.themes.includes('mate')).length).toBeGreaterThanOrEqual(2)
  })

  it('gives every curated scenario required metadata and valid FEN', () => {
    for (const scenario of scenarios) {
      expect(getMissingScenarioFields(scenario)).toEqual([])
      expect(() => new Chess(scenario.originalFen)).not.toThrow()
      expect(() => new Chess(scenario.playableFen)).not.toThrow()
      expect(containsUndefined(scenario)).toBe(false)
    }
  })

  it('loads a scenario into chess.js', () => {
    const scenario = scenarios[0]
    const game = loadScenarioIntoChess(scenario)

    expect(game.fen()).toBe(scenario.playableFen)
  })

  it('lets the existing computer selector return a legal move from a loaded scenario', () => {
    const scenario = scenarios.find((candidate) => candidate.sideToMove === 'b')
    const game = loadScenarioIntoChess(scenario)
    const move = selectComputerMove(game, () => 0)

    expect(move).toBeTruthy()
    expect(isLegalMove(game, move)).toBe(true)
  })
})

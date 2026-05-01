import { describe, expect, it } from 'vitest'
import { filterScenarios, selectRandomScenario } from '../chess/scenarios/scenarioFilters'
import { getCuratedScenarios } from '../chess/scenarios/scenarioLoader'

describe('scenarioFilters', () => {
  const scenarios = getCuratedScenarios()

  it('filters scenarios by theme', () => {
    const mateScenarios = filterScenarios(scenarios, { theme: 'mate' })

    expect(mateScenarios.length).toBeGreaterThanOrEqual(2)
    expect(mateScenarios.every((scenario) => scenario.themes.includes('mate'))).toBe(true)
  })

  it('returns promotion scenarios through the normal theme filter', () => {
    const promotionScenarios = filterScenarios(scenarios, { theme: 'promotion' })

    expect(promotionScenarios.length).toBeGreaterThanOrEqual(2)
    expect(
      promotionScenarios.every((scenario) => scenario.themes.includes('promotion')),
    ).toBe(true)
  })

  it('selects a deterministic random scenario from matching results', () => {
    const scenario = selectRandomScenario(
      scenarios,
      { theme: 'promotion', mode: 'puzzle' },
      () => 0,
    )

    expect(scenario).toBeTruthy()
    expect(scenario.themes).toContain('promotion')
    expect(scenario.mode).toBe('puzzle')
  })
})

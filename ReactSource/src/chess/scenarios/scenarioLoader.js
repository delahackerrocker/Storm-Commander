import { Chess } from 'chess.js'
import curatedScenarios from './curatedScenarios.json'
import { REQUIRED_SCENARIO_FIELDS } from './scenarioTypes'

export function getCuratedScenarios() {
  return curatedScenarios
}

export function findScenarioById(id, scenarios = curatedScenarios) {
  return scenarios.find((scenario) => scenario.id === id) || null
}

export function loadScenarioIntoChess(scenario) {
  return new Chess(scenario.playableFen)
}

export function getMissingScenarioFields(scenario) {
  return REQUIRED_SCENARIO_FIELDS.filter((field) => !Object.hasOwn(scenario, field))
}

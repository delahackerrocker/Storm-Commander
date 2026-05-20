import {
  advanceEncounterTurn,
  applyEncounterMove,
  evaluateEncounterStatus,
} from '../objectives/encounterObjectives'
import { getAllLegalEncounterMoves } from '../tactics/encounterMovement'

function chooseRandom(items, random) {
  return items[Math.min(Math.floor(random() * items.length), items.length - 1)]
}

export function selectSloppyAggressiveMove(encounter, faction, random = Math.random) {
  const legalMoves = getAllLegalEncounterMoves(encounter, faction)

  if (legalMoves.length === 0) {
    return null
  }

  const bestScore = Math.max(...legalMoves.map((move) => move.capturedValue || 0))
  const bestMoves = legalMoves.filter((move) => (move.capturedValue || 0) === bestScore)

  return chooseRandom(bestMoves, random)
}

export function advanceSloppyAggressiveTurn(encounter, random = Math.random) {
  if (encounter.status !== 'active') {
    return encounter
  }

  const move = selectSloppyAggressiveMove(encounter, encounter.currentFaction, random)

  if (!move) {
    return evaluateEncounterStatus(advanceEncounterTurn(encounter))
  }

  return applyEncounterMove(encounter, move)
}

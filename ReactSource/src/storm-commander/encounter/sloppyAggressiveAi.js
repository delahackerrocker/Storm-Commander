import {
  advanceEncounterTurn,
  applyEncounterMove,
  evaluateEncounterStatus,
} from '../objectives/encounterObjectives'
import { getAllLegalEncounterMoves } from '../tactics/encounterMovement'
import { getCommanderTactics } from '../difficulty/difficultySettings'

function chooseRandom(items, random) {
  return items[Math.min(Math.floor(random() * items.length), items.length - 1)]
}

function scoreMove(encounter, move, tactics) {
  const next = applyEncounterMove(encounter, move)
  if (next.status === 'lost') return 100
  if (next.status === 'won') return -100

  const replies = getAllLegalEncounterMoves(next, encounter.playerFaction)
  const largestReplyCapture = Math.max(0, ...replies.map(reply => reply.capturedValue || 0))
  const allowsMissionWin = replies.some(reply => applyEncounterMove(next, reply).status === 'won')

  // A light, single-reply check: stay aggressive, but notice hanging ships and
  // immediate mission threats. No deeper search or positional optimization.
  let pressure = 0
  if (tactics.pressure) {
    const pirates = next.pieces.filter(piece => piece.faction === encounter.playerFaction)
    const distance = square => Math.min(...pirates.map(piece => Math.abs(square.x - piece.square.x) + Math.abs(square.y - piece.square.y)))
    const threats = getAllLegalEncounterMoves(next, encounter.currentFaction)
    const futureCapture = Math.max(0, ...threats.map(threat => threat.capturedValue || 0))
    const approach = Math.max(-2, Math.min(2, distance(move.from) - distance(move.to)))
    pressure = tactics.pressure * (futureCapture + approach)
  }
  return (move.capturedValue || 0) - largestReplyCapture * tactics.riskWeight - (allowsMissionWin ? 6 : 0) + pressure
}

export function selectSloppyAggressiveMove(encounter, faction, random = Math.random) {
  const legalMoves = getAllLegalEncounterMoves(encounter, faction)

  if (legalMoves.length === 0) {
    return null
  }

  const tactics = getCommanderTactics(encounter)
  const scoredMoves = legalMoves.map(move => ({ move, score: scoreMove(encounter, move, tactics) }))
  const bestScore = Math.max(...scoredMoves.map(candidate => candidate.score))
  // Keep variety among similarly good choices, without selecting clear blunders.
  const bestMoves = scoredMoves.filter(candidate => candidate.score >= bestScore - tactics.variety)
    .map(candidate => candidate.move)

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

import { getAllLegalEncounterMoves } from '../tactics/encounterMovement'
import { applyEncounterMove, evaluateEncounterStatus } from '../objectives/encounterObjectives'

function squareKey(square) {
  return `${square.x},${square.y}`
}

function boardSquares(board) {
  return Array.from({ length: board.width * board.height }, (_, index) => ({
    x: index % board.width,
    y: Math.floor(index / board.width),
  }))
}

function shuffled(items, random) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.min(index, Math.floor(random() * (index + 1)))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}

export function canWinOnOpeningMove(encounter) {
  return evaluateEncounterStatus(encounter).status === 'won' ||
    getAllLegalEncounterMoves(encounter, encounter.playerFaction)
      .some(move => applyEncounterMove(encounter, move).status === 'won')
}

function relocateObjective(encounter, random) {
  const isTarget = encounter.objective.type === 'destroyTarget'
  const targetId = encounter.objective.targetPieceId
  const occupied = new Set(encounter.pieces
    .filter(piece => !isTarget || piece.id !== targetId)
    .map(piece => squareKey(piece.square)))
  const candidates = shuffled(boardSquares(encounter.board).filter(square => {
    if (occupied.has(squareKey(square))) return false
    return isTarget || square.x === 0 || square.y === 0 ||
      square.x === encounter.board.width - 1 || square.y === encounter.board.height - 1
  }), random)

  for (const square of candidates) {
    // Recompute legal moves after each relocation: moving a ship can open a firing lane.
    const candidate = isTarget ? {
      ...encounter,
      pieces: encounter.pieces.map(piece => piece.id === targetId ? { ...piece, square } : piece),
    } : {
      ...encounter,
      objective: { ...encounter.objective, extractionSquare: square },
    }
    if (!canWinOnOpeningMove(candidate)) return candidate
  }
  return null
}

export function balanceOpeningObjective(encounter, random = Math.random) {
  if (!['destroyTarget', 'escapeToSquare'].includes(encounter.objective.type)) return encounter
  // Extraction must start empty as well as being unreachable in one legal move.
  const extractionOccupied = encounter.objective.type === 'escapeToSquare' &&
    encounter.pieces.some(piece => squareKey(piece.square) === squareKey(encounter.objective.extractionSquare))
  if (!extractionOccupied && !canWinOnOpeningMove(encounter)) return encounter

  const relocated = relocateObjective(encounter, random)
  if (relocated) return relocated

  // A crowded random layout can cover every candidate. Separate the same fleets
  // onto opposite edges before searching again; finite even with a constant RNG.
  const squares = boardSquares(encounter.board)
  let pirateIndex = 0
  let enemyIndex = squares.length - 1
  const redeployed = {
    ...encounter,
    pieces: encounter.pieces.map(piece => ({
      ...piece,
      square: piece.faction === encounter.playerFaction
        ? squares[pirateIndex++] : squares[enemyIndex--],
    })),
  }
  const balanced = relocateObjective(redeployed, random)
  if (!balanced) throw new Error('Generated fleet cannot support a safe opening objective.')
  return balanced
}

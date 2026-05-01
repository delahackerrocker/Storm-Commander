import { PIECE_VALUES } from './pieceValues'

function scoreMove(move) {
  return move.captured ? PIECE_VALUES[move.captured] || 0 : 0
}

export function selectComputerMove(game, random = Math.random) {
  if (game.turn() !== 'b') {
    return null
  }

  const legalMoves = game
    .moves({ verbose: true })
    .filter((move) => !move.promotion || move.promotion === 'q')

  if (legalMoves.length === 0) {
    return null
  }

  const bestScore = Math.max(...legalMoves.map(scoreMove))
  const bestMoves = legalMoves.filter((move) => scoreMove(move) === bestScore)
  const randomIndex = Math.min(
    bestMoves.length - 1,
    Math.floor(random() * bestMoves.length),
  )

  return bestMoves[randomIndex]
}

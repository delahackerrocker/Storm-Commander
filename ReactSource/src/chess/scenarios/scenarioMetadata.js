import { Chess } from 'chess.js'

const PIECE_KEYS = {
  p: 'pawns',
  n: 'knights',
  b: 'bishops',
  r: 'rooks',
  q: 'queens',
  k: 'king',
}

export function createEmptyMaterialSummary() {
  return {
    white: { pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0, king: 0 },
    black: { pawns: 0, knights: 0, bishops: 0, rooks: 0, queens: 0, king: 0 },
  }
}

export function createChessFromFen(fen) {
  return new Chess(fen)
}

export function computeMaterialSummaryFromFen(fen) {
  const game = createChessFromFen(fen)
  const materialSummary = createEmptyMaterialSummary()

  for (const row of game.board()) {
    for (const piece of row) {
      if (piece) {
        const side = piece.color === 'w' ? 'white' : 'black'
        materialSummary[side][PIECE_KEYS[piece.type]] += 1
      }
    }
  }

  return materialSummary
}

export function computePieceCountFromFen(fen) {
  const materialSummary = computeMaterialSummaryFromFen(fen)

  return Object.values(materialSummary.white)
    .concat(Object.values(materialSummary.black))
    .reduce((total, count) => total + count, 0)
}

export function getSideToMoveFromFen(fen) {
  return fen.split(' ')[1]
}

export function getFullmoveNumberFromFen(fen) {
  return Number(fen.split(' ')[5])
}

export function createDerivedScenarioMetadata(fen) {
  return {
    sideToMove: getSideToMoveFromFen(fen),
    fullmoveNumber: getFullmoveNumberFromFen(fen),
    pieceCount: computePieceCountFromFen(fen),
    materialSummary: computeMaterialSummaryFromFen(fen),
  }
}

export function formatMaterialSummary(materialSummary) {
  const formatSide = (side) => {
    return [
      `${side.king}K`,
      `${side.queens}Q`,
      `${side.rooks}R`,
      `${side.bishops}B`,
      `${side.knights}N`,
      `${side.pawns}P`,
    ].join(' ')
  }

  return `White: ${formatSide(materialSummary.white)} | Black: ${formatSide(
    materialSummary.black,
  )}`
}

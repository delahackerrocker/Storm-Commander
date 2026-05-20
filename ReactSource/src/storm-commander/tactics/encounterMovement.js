import {
  STORM_COMMANDER_PIECE_VALUES,
} from './encounterConstants'

const BISHOP_DIRECTIONS = [
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: -1, y: 1 },
  { x: 1, y: 1 },
]

const ROOK_DIRECTIONS = [
  { x: 0, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
]

const QUEEN_DIRECTIONS = [...BISHOP_DIRECTIONS, ...ROOK_DIRECTIONS]

const KNIGHT_OFFSETS = [
  { x: -2, y: -1 },
  { x: -1, y: -2 },
  { x: 1, y: -2 },
  { x: 2, y: -1 },
  { x: -2, y: 1 },
  { x: -1, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
]

const KING_OFFSETS = QUEEN_DIRECTIONS

function sameSquare(left, right) {
  return left?.x === right?.x && left?.y === right?.y
}

export function isInsideEncounterBoard(board, square) {
  return (
    square.x >= 0 &&
    square.y >= 0 &&
    square.x < board.width &&
    square.y < board.height
  )
}

export function getEncounterPieceAt(encounter, square) {
  return encounter.pieces.find((piece) => sameSquare(piece.square, square)) || null
}

function createMove(piece, to, capturedPiece = null) {
  return {
    pieceId: piece.id,
    from: { ...piece.square },
    to: { ...to },
    capturedPieceId: capturedPiece?.id || null,
    capturedFaction: capturedPiece?.faction || null,
    capturedValue: capturedPiece ? STORM_COMMANDER_PIECE_VALUES[capturedPiece.type] || 0 : 0,
  }
}

function addStepMove(encounter, piece, moves, to, captureOnly = false, quietOnly = false) {
  if (!isInsideEncounterBoard(encounter.board, to)) {
    return
  }

  const occupant = getEncounterPieceAt(encounter, to)

  if (!occupant && !captureOnly) {
    moves.push(createMove(piece, to))
    return
  }

  if (occupant && occupant.faction !== piece.faction && !quietOnly) {
    moves.push(createMove(piece, to, occupant))
  }
}

function addSlidingMoves(encounter, piece, moves, directions) {
  for (const direction of directions) {
    let to = {
      x: piece.square.x + direction.x,
      y: piece.square.y + direction.y,
    }

    while (isInsideEncounterBoard(encounter.board, to)) {
      const occupant = getEncounterPieceAt(encounter, to)

      if (!occupant) {
        moves.push(createMove(piece, to))
      } else {
        if (occupant.faction !== piece.faction) {
          moves.push(createMove(piece, to, occupant))
        }
        break
      }

      to = {
        x: to.x + direction.x,
        y: to.y + direction.y,
      }
    }
  }
}

function addPawnMoves(encounter, piece, moves) {
  addStepMove(encounter, piece, moves, { x: piece.square.x, y: piece.square.y - 1 }, false, true)
  addStepMove(encounter, piece, moves, { x: piece.square.x, y: piece.square.y + 1 }, false, true)

  for (const yDirection of [-1, 1]) {
    for (const xDirection of [-1, 1]) {
      addStepMove(
        encounter,
        piece,
        moves,
        { x: piece.square.x + xDirection, y: piece.square.y + yDirection },
        true,
      )
    }
  }
}

export function getLegalEncounterMoves(encounter, pieceId) {
  if (encounter.status && encounter.status !== 'active') {
    return []
  }

  const piece = encounter.pieces.find((candidate) => candidate.id === pieceId)
  const moves = []

  if (!piece) {
    return moves
  }

  if (piece.type === 'p') {
    addPawnMoves(encounter, piece, moves)
  } else if (piece.type === 'b') {
    addSlidingMoves(encounter, piece, moves, BISHOP_DIRECTIONS)
  } else if (piece.type === 'r') {
    addSlidingMoves(encounter, piece, moves, ROOK_DIRECTIONS)
  } else if (piece.type === 'q') {
    addSlidingMoves(encounter, piece, moves, QUEEN_DIRECTIONS)
  } else if (piece.type === 'n') {
    for (const offset of KNIGHT_OFFSETS) {
      addStepMove(encounter, piece, moves, {
        x: piece.square.x + offset.x,
        y: piece.square.y + offset.y,
      })
    }
  } else if (piece.type === 'k') {
    for (const offset of KING_OFFSETS) {
      addStepMove(encounter, piece, moves, {
        x: piece.square.x + offset.x,
        y: piece.square.y + offset.y,
      })
    }
  }

  return moves
}

export function getAllLegalEncounterMoves(encounter, faction) {
  return encounter.pieces
    .filter((piece) => piece.faction === faction)
    .flatMap((piece) => getLegalEncounterMoves(encounter, piece.id))
}

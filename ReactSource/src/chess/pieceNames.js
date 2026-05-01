const PIECE_NAMES = {
  k: 'king',
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
  p: 'pawn',
}

export function getPieceName(piece) {
  if (!piece) {
    return 'empty'
  }

  const color = piece.color === 'w' ? 'White' : 'Black'
  return `${color} ${PIECE_NAMES[piece.type]}`
}

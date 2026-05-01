const PIECE_GLYPHS = {
  wk: '♔',
  wq: '♕',
  wr: '♖',
  wb: '♗',
  wn: '♘',
  wp: '♙',
  bk: '♚',
  bq: '♛',
  br: '♜',
  bb: '♝',
  bn: '♞',
  bp: '♟',
}

export function ChessPiece({ piece }) {
  if (!piece) {
    return null
  }

  return (
    <span className={`chess-piece chess-piece-${piece.color}`} aria-hidden="true">
      {PIECE_GLYPHS[`${piece.color}${piece.type}`]}
    </span>
  )
}

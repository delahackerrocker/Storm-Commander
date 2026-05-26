import { BOARD_SQUARES } from '../chess/squareUtils'
import { ChessSquare } from './ChessSquare'

const STORM_STARFIELD_LAYERS = [
  ['nebula', null],
  ['far', 'far'],
  ['dust', 'dust'],
  ['mid', 'mid'],
  ['near', 'near'],
  ['asteroid-far', 'asteroidFar'],
  ['asteroid-wide', 'asteroidWide'],
  ['asteroid-near', 'asteroidNear'],
]

export function ChessBoard({
  game,
  inputDisabled,
  lastMove,
  legalMoves,
  onSquareClick,
  pieceRotation,
  pieceSet = 'unicode',
  selectedSquare,
  sidePieceFactions,
  sideVisualThemes,
  showStarfieldLayers = false,
  starfieldLayerStyles,
}) {
  const legalMoveByDestination = new Map()

  for (const move of legalMoves) {
    if (!legalMoveByDestination.has(move.to)) {
      legalMoveByDestination.set(move.to, move)
    }
  }

  const turnVisualTheme = sideVisualThemes?.[game.turn()]
  const lastMoveVisualTheme = sideVisualThemes?.[lastMove?.color]
  const boardStyle =
    turnVisualTheme || lastMoveVisualTheme
      ? {
          ...(turnVisualTheme
            ? {
                '--storm-turn-grid-line': turnVisualTheme.gridLine,
                '--storm-turn-hint': turnVisualTheme.hint,
                '--storm-turn-hint-soft': turnVisualTheme.hintSoft,
              }
            : {}),
          ...(lastMoveVisualTheme
            ? {
                '--storm-last-move-ring': lastMoveVisualTheme.hint,
                '--storm-last-move-ring-soft': lastMoveVisualTheme.hintSoft,
              }
            : {}),
        }
      : undefined

  return (
    <div className="board-wrap">
      <div className="board-files board-files-top" aria-hidden="true">
        <span>a</span>
        <span>b</span>
        <span>c</span>
        <span>d</span>
        <span>e</span>
        <span>f</span>
        <span>g</span>
        <span>h</span>
      </div>
      <div className="board-with-ranks">
        <div className="board-ranks" aria-hidden="true">
          <span>8</span>
          <span>7</span>
          <span>6</span>
          <span>5</span>
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>
        <div
          className="chess-board"
          style={boardStyle}
          data-side-to-move={game.turn()}
          data-last-move-side={lastMove?.color}
          data-white-faction={sidePieceFactions?.w}
          data-black-faction={sidePieceFactions?.b}
          role="grid"
          aria-label="Chess board"
        >
          {pieceSet === 'storm-commander-png' &&
          (showStarfieldLayers || starfieldLayerStyles) ? (
            <div className="storm-starfield-layers" aria-hidden="true">
              {STORM_STARFIELD_LAYERS.map(([layerId, styleId]) => (
                <span
                  key={layerId}
                  className={`storm-starfield-layer storm-starfield-layer-${layerId}`}
                  style={styleId && starfieldLayerStyles ? starfieldLayerStyles[styleId] : undefined}
                />
              ))}
            </div>
          ) : null}
          {BOARD_SQUARES.map((square) => {
            const piece = game.get(square)
            const move = legalMoveByDestination.get(square)

            return (
              <ChessSquare
                key={square}
                square={square}
                piece={piece}
                isSelected={selectedSquare === square}
                isLegalMove={Boolean(move)}
                isCapture={Boolean(move?.captured)}
                isLastMove={lastMove?.from === square || lastMove?.to === square}
                inputDisabled={inputDisabled}
                onClick={onSquareClick}
                pieceRotation={pieceRotation}
                pieceSet={pieceSet}
                sidePieceFactions={sidePieceFactions}
              />
            )
          })}
        </div>
        <div className="board-ranks board-ranks-right" aria-hidden="true">
          <span>8</span>
          <span>7</span>
          <span>6</span>
          <span>5</span>
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>
      </div>
      <div className="board-files" aria-hidden="true">
        <span>a</span>
        <span>b</span>
        <span>c</span>
        <span>d</span>
        <span>e</span>
        <span>f</span>
        <span>g</span>
        <span>h</span>
      </div>
    </div>
  )
}

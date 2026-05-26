import { BOARD_SQUARES } from '../chess/squareUtils'
import {
  getStormChessMoveAnimationStyle,
  getStormLegalMoveHintStyle,
} from '../chess/stormCommanderBoardEffects'
import { ChessPiece } from './ChessPiece'
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

function ChessMoveAnimationLayer({ animation, pieceSet, sidePieceFactions }) {
  if (!animation?.movingPiece) {
    return null
  }

  const isCapture = Boolean(animation.move.captured)

  return (
    <div
      className={`storm-capture-animation-layer ${isCapture ? 'is-capture' : 'is-quiet'}`}
      data-faction={animation.faction}
      style={getStormChessMoveAnimationStyle(animation)}
      aria-hidden="true"
    >
      <div className="storm-capture-attacker" data-faction={animation.faction}>
        <ChessPiece
          piece={animation.movingPiece}
          pieceSet={pieceSet}
          sidePieceFactions={sidePieceFactions}
        />
        {isCapture ? (
          <div className="storm-capture-lasers">
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className="storm-capture-laser"
                style={{
                  '--storm-laser-index': index,
                  '--storm-laser-turn-delay': '0.2s',
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
      {isCapture ? (
        <>
          <div className="storm-capture-hit-sparks">
            {Array.from({ length: 4 }, (_, index) => (
              <span
                key={index}
                className="storm-capture-hit-spark"
                style={{ '--storm-spark-index': index }}
              />
            ))}
          </div>
          <span className="storm-capture-explosion" />
        </>
      ) : null}
    </div>
  )
}

export function ChessBoard({
  enableStormBoardEffects = false,
  game,
  inputDisabled,
  lastMove,
  legalMoves,
  onSquareClick,
  pendingMoveAnimation,
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
            const isLastMoveFrom = lastMove?.from === square
            const isLastMoveTo = lastMove?.to === square
            const isMoveAnimationFrom = pendingMoveAnimation?.move.from === square
            const isMoveAnimationTo = pendingMoveAnimation?.move.to === square
            const isMoveAnimationCaptureTo = Boolean(
              isMoveAnimationTo && pendingMoveAnimation?.move.captured,
            )
            const classNameExtras = [
              isLastMoveFrom ? 'is-last-move-from' : '',
              isLastMoveTo ? 'is-last-move-to' : '',
              isMoveAnimationFrom ? 'is-move-animation-from' : '',
              isMoveAnimationTo ? 'is-move-animation-to' : '',
              isMoveAnimationCaptureTo ? 'is-move-animation-capture-to' : '',
            ]

            return (
              <ChessSquare
                key={square}
                square={square}
                piece={piece}
                isSelected={selectedSquare === square}
                isLegalMove={Boolean(move)}
                isCapture={Boolean(move?.captured)}
                isLastMove={isLastMoveFrom || isLastMoveTo}
                inputDisabled={inputDisabled}
                classNameExtras={classNameExtras}
                dataFaction={sidePieceFactions?.[piece?.color]}
                legalMoveHintStyle={
                  enableStormBoardEffects
                    ? getStormLegalMoveHintStyle(selectedSquare, move)
                    : undefined
                }
                onClick={onSquareClick}
                pieceRotation={pieceRotation}
                pieceSet={pieceSet}
                showStormSelectionRing={enableStormBoardEffects}
                sidePieceFactions={sidePieceFactions}
              />
            )
          })}
          {enableStormBoardEffects ? (
            <ChessMoveAnimationLayer
              animation={pendingMoveAnimation}
              pieceSet={pieceSet}
              sidePieceFactions={sidePieceFactions}
            />
          ) : null}
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

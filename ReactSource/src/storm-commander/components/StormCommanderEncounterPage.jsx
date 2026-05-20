import { useEffect, useMemo, useState } from 'react'
import {
  STORM_COMMANDER_FACTION_PIECE_ASSETS,
  STORM_COMMANDER_FACTION_VISUAL_THEMES,
} from '../../chess/stormCommanderPieceAssets'
import { StormCommanderShipPiece } from '../../components/StormCommanderShipPiece'
import {
  advanceSloppyAggressiveTurn,
} from '../encounter/sloppyAggressiveAi'
import {
  getObjectiveProgressText,
  applyEncounterMove,
} from '../objectives/encounterObjectives'
import {
  getEncounterPieceAt,
  getLegalEncounterMoves,
} from '../tactics/encounterMovement'
import {
  STORM_COMMANDER_MOVEMENT_HINTS,
  STORM_COMMANDER_PILOT_BARKS,
  getEncounterPieceLabel,
  getFactionDisplayName,
  getPieceDisplayName,
} from '../tactics/encounterConstants'

const ENEMY_MOVE_DELAY_MS = 320

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

function sameSquare(left, right) {
  return left?.x === right?.x && left?.y === right?.y
}

function createSquares(board) {
  const squares = []

  for (let y = 0; y < board.height; y += 1) {
    for (let x = 0; x < board.width; x += 1) {
      squares.push({ x, y })
    }
  }

  return squares
}

function getSquareLabel(square, board) {
  return `${String.fromCharCode(65 + square.x)}${board.height - square.y}`
}

function getBoardStyle(encounter) {
  const currentTheme = STORM_COMMANDER_FACTION_VISUAL_THEMES[encounter.currentFaction]
  const lastMoveTheme = STORM_COMMANDER_FACTION_VISUAL_THEMES[encounter.lastMove?.faction]

  return {
    '--storm-encounter-columns': encounter.board.width,
    '--storm-encounter-rows': encounter.board.height,
    ...(currentTheme
      ? {
          '--storm-turn-grid-line': currentTheme.gridLine,
          '--storm-turn-hint': currentTheme.hint,
          '--storm-turn-hint-soft': currentTheme.hintSoft,
        }
      : {}),
    ...(lastMoveTheme
      ? {
          '--storm-last-move-ring': lastMoveTheme.hint,
          '--storm-last-move-ring-soft': lastMoveTheme.hintSoft,
        }
      : {}),
  }
}

function getStatusText(encounter, isEnemyThinking) {
  if (encounter.status === 'won') {
    return 'Victory'
  }

  if (encounter.status === 'lost') {
    return 'Defeat'
  }

  if (isEnemyThinking) {
    return 'Enemy maneuvering...'
  }

  return `${getFactionDisplayName(encounter.currentFaction)} to move`
}

function getObjectiveTypeLabel(type) {
  if (type === 'destroyTarget') {
    return 'Destroy Target'
  }

  if (type === 'surviveTurns') {
    return 'Survive Turns'
  }

  if (type === 'escapeToSquare') {
    return 'Escape To Square'
  }

  if (type === 'captureValue') {
    return 'Capture Value'
  }

  return 'Objective'
}

function StormCommanderEncounterPiece({ piece, pieceRotation }) {
  if (!piece) {
    return null
  }

  return (
    <StormCommanderShipPiece
      imageClassName="storm-encounter-piece"
      src={STORM_COMMANDER_FACTION_PIECE_ASSETS[piece.faction][piece.type]}
      alt={getEncounterPieceLabel(piece)}
      faction={piece.faction}
      pieceType={piece.type}
      pieceRotation={pieceRotation}
    />
  )
}

function PilotPanel({ selectedPiece }) {
  if (!selectedPiece) {
    return (
      <section className="storm-pilot-panel" aria-label="Cockpit panel">
        <h2>Cockpit</h2>
        <p className="storm-pilot-empty">Select a Pirate ship to open comms.</p>
      </section>
    )
  }

  const pieceName = getPieceDisplayName(selectedPiece.type)
  const title = `Pirate ${pieceName[0].toUpperCase()}${pieceName.slice(1)} Pilot`

  return (
    <section className="storm-pilot-panel" aria-label="Cockpit panel">
      <div
        className="storm-pilot-portrait"
        role="img"
        aria-label={`Pirate ${pieceName} cockpit placeholder`}
      >
        <span>{pieceName.slice(0, 2).toUpperCase()}</span>
      </div>
      <div>
        <p className="eyebrow">Cockpit Link</p>
        <h2>{title}</h2>
        <dl className="storm-pilot-list">
          <div>
            <dt>Faction</dt>
            <dd>Pirate</dd>
          </div>
          <div>
            <dt>Piece</dt>
            <dd>{pieceName}</dd>
          </div>
        </dl>
        <p className="storm-movement-hint">
          <strong>Movement:</strong> {STORM_COMMANDER_MOVEMENT_HINTS[selectedPiece.type]}
        </p>
        <p className="storm-pilot-bark">"{STORM_COMMANDER_PILOT_BARKS[selectedPiece.type]}"</p>
      </div>
    </section>
  )
}

export function StormCommanderEncounterPage({
  encounter,
  onBack,
  onNewEncounter,
  onReturnToChess,
  pieceRotation,
  setEncounter,
  starfieldLayerStyles,
}) {
  const [selection, setSelection] = useState(null)
  const selectedPiece =
    selection?.encounterId === encounter.id
      ? encounter.pieces.find((piece) => piece.id === selection.pieceId) || null
      : null
  const legalMoves = useMemo(
    () =>
      selectedPiece && encounter.currentFaction === encounter.playerFaction
        ? getLegalEncounterMoves(encounter, selectedPiece.id)
        : [],
    [encounter, selectedPiece],
  )
  const isEnemyThinking =
    encounter.status === 'active' && encounter.currentFaction !== encounter.playerFaction

  useEffect(() => {
    if (!isEnemyThinking) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setEncounter((currentEncounter) => advanceSloppyAggressiveTurn(currentEncounter))
    }, ENEMY_MOVE_DELAY_MS)

    return () => window.clearTimeout(timerId)
  }, [isEnemyThinking, setEncounter])

  function handleSquareClick(square) {
    if (encounter.status !== 'active' || encounter.currentFaction !== encounter.playerFaction) {
      return
    }

    const selectedMove = legalMoves.find((move) => sameSquare(move.to, square))

    if (selectedMove) {
      setEncounter((currentEncounter) => applyEncounterMove(currentEncounter, selectedMove))
      setSelection(null)
      return
    }

    const piece = getEncounterPieceAt(encounter, square)

    if (piece?.faction === encounter.playerFaction) {
      setSelection({ encounterId: encounter.id, pieceId: piece.id })
    } else {
      setSelection(null)
    }
  }

  const legalMoveForSquare = new Map(legalMoves.map((move) => [`${move.to.x},${move.to.y}`, move]))
  const squares = createSquares(encounter.board)
  const boardStyle = getBoardStyle(encounter)

  return (
    <div className="game-page storm-commander-root storm-encounter-root">
      <div className="storm-encounter-topbar">
        <button type="button" className="back-button" onClick={onBack}>
          Back
        </button>
        <button type="button" className="storm-mode-button" onClick={onReturnToChess}>
          Return to Chess Drill
        </button>
        <button type="button" className="storm-primary-button" onClick={onNewEncounter}>
          New Random Encounter
        </button>
      </div>

      <main className="storm-encounter-shell">
        <section className="storm-encounter-play-area" aria-label="Random encounter board">
          <div
            className="storm-encounter-board"
            style={boardStyle}
            data-current-faction={encounter.currentFaction}
            role="grid"
            aria-label={`${encounter.board.width} by ${encounter.board.height} Storm Commander encounter board`}
          >
            {starfieldLayerStyles ? (
              <div className="storm-starfield-layers" aria-hidden="true">
                {STORM_STARFIELD_LAYERS.map(([layerId, styleId]) => (
                  <span
                    key={layerId}
                    className={`storm-starfield-layer storm-starfield-layer-${layerId}`}
                    style={styleId ? starfieldLayerStyles[styleId] : undefined}
                  />
                ))}
              </div>
            ) : null}

            {squares.map((square) => {
              const piece = getEncounterPieceAt(encounter, square)
              const legalMove = legalMoveForSquare.get(`${square.x},${square.y}`)
              const isExtraction = sameSquare(square, encounter.objective.extractionSquare)
              const isTarget =
                Boolean(encounter.objective.targetPieceId) &&
                piece?.id === encounter.objective.targetPieceId
              const className = [
                'storm-encounter-square',
                (square.x + square.y) % 2 === 0 ? 'is-light' : 'is-dark',
                selectedPiece && sameSquare(selectedPiece.square, square) ? 'is-selected' : '',
                legalMove ? 'is-legal-move' : '',
                legalMove?.capturedPieceId ? 'is-capture' : '',
                isExtraction ? 'is-extraction' : '',
                isTarget ? 'is-target' : '',
                encounter.lastMove &&
                (sameSquare(encounter.lastMove.from, square) || sameSquare(encounter.lastMove.to, square))
                  ? 'is-last-move'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')
              const actionLabel = legalMove?.capturedPieceId
                ? 'capture destination'
                : legalMove
                  ? 'legal destination'
                  : 'square'

              return (
                <button
                  key={`${square.x},${square.y}`}
                  type="button"
                  className={className}
                  data-testid="storm-encounter-square"
                  aria-label={`${getSquareLabel(square, encounter.board)} ${getEncounterPieceLabel(piece)} ${actionLabel}`}
                  onClick={() => handleSquareClick(square)}
                >
                  <StormCommanderEncounterPiece piece={piece} pieceRotation={pieceRotation} />
                </button>
              )
            })}
          </div>
        </section>

        <aside className="storm-encounter-panel" aria-label="Encounter status">
          <section className="storm-encounter-brief">
            <p className="eyebrow">Storm Commander Alpha</p>
            <h1>{encounter.title}</h1>
            <p>{encounter.intro}</p>
          </section>

          <section className="storm-objective-panel">
            <h2>Objective: {getObjectiveTypeLabel(encounter.objective.type)}</h2>
            <p>{encounter.objective.text}</p>
            <p className="storm-objective-progress">{getObjectiveProgressText(encounter)}</p>
            {encounter.outcome ? <p className="storm-outcome">{encounter.outcome}</p> : null}
          </section>

          <dl className="storm-encounter-stats">
            <div>
              <dt>Status</dt>
              <dd>{getStatusText(encounter, isEnemyThinking)}</dd>
            </div>
            <div>
              <dt>Board</dt>
              <dd>
                {encounter.board.width}x{encounter.board.height}
              </dd>
            </div>
            <div>
              <dt>Factions</dt>
              <dd>{encounter.factions.map(getFactionDisplayName).join(' / ')}</dd>
            </div>
            <div>
              <dt>AI</dt>
              <dd>Sloppy Aggressive</dd>
            </div>
          </dl>

          <PilotPanel selectedPiece={selectedPiece} />
        </aside>
      </main>
    </div>
  )
}

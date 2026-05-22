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

function getInitialCommsPiece(pieces, encounterId) {
  if (pieces.length === 0) {
    return null
  }

  const seed = String(encounterId)
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0)

  return pieces[seed % pieces.length]
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

function getMovementPatternSquares(pieceType) {
  if (pieceType === 'p') {
    return new Set(['2,1', '1,1', '3,1', '2,3', '1,3', '3,3'])
  }

  if (pieceType === 'b') {
    return new Set(['0,0', '1,1', '3,1', '4,0', '1,3', '0,4', '3,3', '4,4'])
  }

  if (pieceType === 'n') {
    return new Set(['1,0', '3,0', '0,1', '4,1', '0,3', '4,3', '1,4', '3,4'])
  }

  if (pieceType === 'r') {
    return new Set(['2,0', '2,1', '0,2', '1,2', '3,2', '4,2', '2,3', '2,4'])
  }

  if (pieceType === 'q') {
    return new Set([
      '0,0',
      '2,0',
      '4,0',
      '1,1',
      '2,1',
      '3,1',
      '0,2',
      '1,2',
      '3,2',
      '4,2',
      '1,3',
      '2,3',
      '3,3',
      '0,4',
      '2,4',
      '4,4',
    ])
  }

  return new Set(['1,1', '2,1', '3,1', '1,2', '3,2', '1,3', '2,3', '3,3'])
}

function MovementPatternIcon({ pieceType }) {
  const movementSquares = getMovementPatternSquares(pieceType)
  const cells = []

  for (let y = 0; y < 5; y += 1) {
    for (let x = 0; x < 5; x += 1) {
      const isOrigin = x === 2 && y === 2
      const isMovementSquare = movementSquares.has(`${x},${y}`)
      const className = [
        'storm-movement-pattern-cell',
        isOrigin ? 'is-origin' : '',
        isMovementSquare ? 'is-move' : '',
      ]
        .filter(Boolean)
        .join(' ')

      cells.push(<span key={`${x},${y}`} className={className} />)
    }
  }

  return (
    <div
      className="storm-movement-pattern"
      role="img"
      aria-label={STORM_COMMANDER_MOVEMENT_HINTS[pieceType]}
    >
      {cells}
    </div>
  )
}

function ShipCommsWindow({ ariaLabel, board, emptyText, piece, pieceRotation, title, variant }) {
  if (!piece) {
    return (
      <aside
        className={`storm-comms-window storm-comms-window-${variant} is-empty`}
        aria-label={ariaLabel}
      >
        <p className="eyebrow">{title}</p>
        <h2>No ship selected</h2>
        <p className="storm-comms-empty">{emptyText}</p>
      </aside>
    )
  }

  const pieceName = getPieceDisplayName(piece.type)
  const factionName = getFactionDisplayName(piece.faction)
  const displayPieceName = `${pieceName[0].toUpperCase()}${pieceName.slice(1)}`
  const pilotTitle = `${factionName} ${displayPieceName}`
  const squareLabel = getSquareLabel(piece.square, board)

  return (
    <aside className={`storm-comms-window storm-comms-window-${variant}`} aria-label={ariaLabel}>
      <p className="eyebrow">{title}</p>
      <div className="storm-comms-portrait" role="img" aria-label={`${pilotTitle} comms portrait`}>
        <StormCommanderEncounterPiece piece={piece} pieceRotation={pieceRotation} />
      </div>
      <h2>{pilotTitle} : {squareLabel}</h2>
      <div className="storm-comms-movement">
        <MovementPatternIcon pieceType={piece.type} />
      </div>
      <p className="storm-comms-bark">"{STORM_COMMANDER_PILOT_BARKS[piece.type]}"</p>
    </aside>
  )
}

function MissionStatList({ encounter, isEnemyThinking }) {
  return (
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
  )
}

function MissionSummaryPanel({ encounter }) {
  return (
    <section className="storm-mission-summary" aria-label="Mission quick status">
      <dl className="storm-mission-summary-grid">
        <div>
          <dt>Objective</dt>
          <dd>{getObjectiveTypeLabel(encounter.objective.type)}</dd>
        </div>
        <div>
          <dt>Progress</dt>
          <dd>{getObjectiveProgressText(encounter)}</dd>
        </div>
      </dl>
    </section>
  )
}

function MissionBriefingDialog({ encounter, isEnemyThinking, onDismiss }) {
  return (
    <div className="storm-mission-overlay">
      <section
        id="storm-mission-briefing"
        className="storm-mission-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="storm-mission-briefing-title"
      >
        <button
          type="button"
          className="storm-mission-dismiss"
          onClick={onDismiss}
          autoFocus
        >
          Dismiss
        </button>

        <p className="eyebrow">Storm Commander Alpha</p>
        <h1 id="storm-mission-briefing-title">{encounter.title}</h1>
        <p className="storm-mission-intro">{encounter.intro}</p>

        <section className="storm-objective-panel">
          <h2>Objective: {getObjectiveTypeLabel(encounter.objective.type)}</h2>
          <p>{encounter.objective.text}</p>
          <p className="storm-objective-progress">{getObjectiveProgressText(encounter)}</p>
          {encounter.outcome ? <p className="storm-outcome">{encounter.outcome}</p> : null}
        </section>

        <MissionStatList encounter={encounter} isEnemyThinking={isEnemyThinking} />

        <p className="storm-mission-return-note">
          Dismiss this briefing to command the board. Use Mission in the HUD to reopen it.
        </p>
      </section>
    </div>
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
  const [playerCommsSelection, setPlayerCommsSelection] = useState(null)
  const [opponentCommsSelection, setOpponentCommsSelection] = useState(null)
  const [dismissedMissionEncounterId, setDismissedMissionEncounterId] = useState(null)
  const selectedPiece =
    selection?.encounterId === encounter.id
      ? encounter.pieces.find((piece) => piece.id === selection.pieceId) || null
      : null
  const playerPieces = encounter.pieces.filter((piece) => piece.faction === encounter.playerFaction)
  const playerCommsPiece =
    playerCommsSelection?.encounterId === encounter.id
      ? playerPieces.find((piece) => piece.id === playerCommsSelection.pieceId) ||
        getInitialCommsPiece(playerPieces, encounter.id)
      : getInitialCommsPiece(playerPieces, encounter.id)
  const opponentPieces = encounter.pieces.filter((piece) => piece.faction !== encounter.playerFaction)
  const latestOpponentMovePiece =
    encounter.lastMove?.faction && encounter.lastMove.faction !== encounter.playerFaction
      ? encounter.pieces.find((piece) => piece.id === encounter.lastMove.pieceId) || null
      : null
  const latestOpponentMovePieceId = latestOpponentMovePiece?.id || null
  const manuallySelectedOpponentPiece =
    opponentCommsSelection?.encounterId === encounter.id &&
    opponentCommsSelection.latestOpponentMovePieceId === latestOpponentMovePieceId
      ? opponentPieces.find((piece) => piece.id === opponentCommsSelection.pieceId) || null
      : null
  const opponentCommsPiece =
    manuallySelectedOpponentPiece ||
    latestOpponentMovePiece ||
    opponentPieces[0] ||
    null
  const legalMoves = useMemo(
    () =>
      selectedPiece && encounter.currentFaction === encounter.playerFaction
        ? getLegalEncounterMoves(encounter, selectedPiece.id)
        : [],
    [encounter, selectedPiece],
  )
  const isEnemyThinking =
    encounter.status === 'active' && encounter.currentFaction !== encounter.playerFaction
  const isMissionBriefingOpen = dismissedMissionEncounterId !== encounter.id

  useEffect(() => {
    if (!isEnemyThinking) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setEncounter((currentEncounter) => advanceSloppyAggressiveTurn(currentEncounter))
    }, ENEMY_MOVE_DELAY_MS)

    return () => window.clearTimeout(timerId)
  }, [isEnemyThinking, setEncounter])

  useEffect(() => {
    if (!isMissionBriefingOpen) {
      return undefined
    }

    function handleMissionKeyDown(event) {
      if (event.key === 'Escape') {
        setDismissedMissionEncounterId(encounter.id)
      }
    }

    window.addEventListener('keydown', handleMissionKeyDown)

    return () => window.removeEventListener('keydown', handleMissionKeyDown)
  }, [encounter.id, isMissionBriefingOpen])

  function handleNewEncounter() {
    onNewEncounter()
  }

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
      setPlayerCommsSelection({ encounterId: encounter.id, pieceId: piece.id })
    } else if (piece) {
      setOpponentCommsSelection({
        encounterId: encounter.id,
        latestOpponentMovePieceId,
        pieceId: piece.id,
      })
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
        <div className="storm-encounter-brand">
          <p className="eyebrow">Storm Commander</p>
          <p>Pirate raid tactical board</p>
        </div>
        <div className="storm-encounter-actions">
          {onBack ? (
            <button type="button" className="back-button" onClick={onBack}>
              Back
            </button>
          ) : null}
          {onReturnToChess ? (
            <button type="button" className="storm-mode-button" onClick={onReturnToChess}>
              Return to Chess Drill
            </button>
          ) : null}
          <button
            type="button"
            className="storm-mission-button"
            aria-haspopup="dialog"
            aria-expanded={isMissionBriefingOpen}
            aria-controls="storm-mission-briefing"
            onClick={() => setDismissedMissionEncounterId(null)}
          >
            Mission
          </button>
          <button
            type="button"
            className="storm-primary-button storm-icon-button"
            aria-label="New Random Encounter"
            title="New Random Encounter"
            onClick={handleNewEncounter}
          >
            <span className="storm-dice-icon" aria-hidden="true">
              <span className="storm-dice-pip storm-dice-pip-one" />
              <span className="storm-dice-pip storm-dice-pip-two" />
              <span className="storm-dice-pip storm-dice-pip-three" />
              <span className="storm-dice-pip storm-dice-pip-four" />
              <span className="storm-dice-pip storm-dice-pip-five" />
            </span>
          </button>
        </div>
      </div>

      <main className="storm-encounter-shell">
        <ShipCommsWindow
          ariaLabel="Player comms"
          board={encounter.board}
          emptyText="Select a Pirate ship to open player comms."
          piece={playerCommsPiece}
          pieceRotation={pieceRotation}
          title="Player Comms"
          variant="player"
        />

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

        <ShipCommsWindow
          ariaLabel="Opponent comms"
          board={encounter.board}
          emptyText="Touch an opponent ship to scan their comms."
          piece={opponentCommsPiece}
          pieceRotation={pieceRotation}
          title="Opponent Comms"
          variant="opponent"
        />

        <aside className="storm-encounter-panel" aria-label="Encounter status">
          <MissionSummaryPanel encounter={encounter} />
        </aside>
      </main>

      {isMissionBriefingOpen ? (
        <MissionBriefingDialog
          encounter={encounter}
          isEnemyThinking={isEnemyThinking}
          onDismiss={() => setDismissedMissionEncounterId(encounter.id)}
        />
      ) : null}
    </div>
  )
}

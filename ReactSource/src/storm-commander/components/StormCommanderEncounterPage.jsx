import { useEffect, useMemo, useRef, useState } from 'react'
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
  evaluateEncounterStatus,
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
const SELECTION_FLASH_DURATION_MS = 300

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

function getEncounterRootStyle(encounter) {
  const playerTheme = STORM_COMMANDER_FACTION_VISUAL_THEMES[encounter.playerFaction]
  const opponentFaction = encounter.factions.find((faction) => faction !== encounter.playerFaction)
  const opponentTheme = STORM_COMMANDER_FACTION_VISUAL_THEMES[opponentFaction]

  return {
    ...(playerTheme ? { '--storm-player-faction-bg': playerTheme.hintSoft } : {}),
    ...(opponentTheme ? { '--storm-opponent-faction-bg': opponentTheme.hintSoft } : {}),
  }
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

function MissionObjectiveTargetIcon({ encounter }) {
  if (encounter.objective?.type === 'escapeToSquare' && encounter.objective.extractionSquare) {
    return (
      <span
        className="storm-objective-target-icon is-extraction"
        role="img"
        aria-label={`Extraction target ${getSquareLabel(
          encounter.objective.extractionSquare,
          encounter.board,
        )}`}
      >
        <span className="storm-objective-target-grid" aria-hidden="true" />
      </span>
    )
  }

  if (encounter.objective?.type === 'destroyTarget' && encounter.objective.targetPieceId) {
    const targetPiece = encounter.pieces.find(
      (piece) => piece.id === encounter.objective.targetPieceId,
    )

    if (!targetPiece) {
      return null
    }

    return (
      <span className="storm-objective-target-icon is-target">
        <StormCommanderShipPiece
          imageClassName="storm-objective-target-ship"
          src={STORM_COMMANDER_FACTION_PIECE_ASSETS[targetPiece.faction][targetPiece.type]}
          alt={`${getEncounterPieceLabel(targetPiece)} target`}
          faction={targetPiece.faction}
          pieceType={targetPiece.type}
        />
      </span>
    )
  }

  return null
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

function ShipCommsWindow({ ariaLabel, board, emptyText, piece, pieceRotation, variant }) {
  if (!piece) {
    return (
      <aside
        className={`storm-comms-window storm-comms-window-${variant} is-empty`}
        aria-label={ariaLabel}
      >
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
      <div
        className="storm-comms-portrait"
        role="img"
        aria-label={`${pilotTitle} comms portrait`}
        data-faction={piece.faction}
      >
        <StormCommanderEncounterPiece piece={piece} pieceRotation={pieceRotation} />
      </div>
      <h2>{pilotTitle} : {squareLabel}</h2>
      <div className="storm-comms-transmission">
        <MovementPatternIcon pieceType={piece.type} />
        <p className="storm-comms-bark">"{STORM_COMMANDER_PILOT_BARKS[piece.type]}"</p>
      </div>
    </aside>
  )
}

function MissionStatList({ encounter }) {
  return (
    <dl className="storm-encounter-stats">
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

function NewEncounterButton({ className = '', onNewEncounter }) {
  return (
    <button
      type="button"
      className={`storm-primary-button storm-icon-button ${className}`.trim()}
      aria-label="New Random Encounter"
      title="New Random Encounter"
      onClick={onNewEncounter}
    >
      <span className="storm-dice-icon" aria-hidden="true">
        <span className="storm-dice-pip storm-dice-pip-one" />
        <span className="storm-dice-pip storm-dice-pip-two" />
        <span className="storm-dice-pip storm-dice-pip-three" />
        <span className="storm-dice-pip storm-dice-pip-four" />
        <span className="storm-dice-pip storm-dice-pip-five" />
      </span>
    </button>
  )
}

function MissionSummaryPanel({
  encounter,
  isMissionBriefingOpen,
  onNewEncounter,
  onOpenMission,
}) {
  return (
    <section className="storm-mission-summary" aria-label="Mission quick status">
      <div className="storm-mission-summary-row">
        <button
          type="button"
          className="storm-mission-button storm-mission-summary-button"
          aria-haspopup="dialog"
          aria-expanded={isMissionBriefingOpen}
          aria-controls="storm-mission-briefing"
          onClick={onOpenMission}
        >
          Mission
        </button>
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
        <NewEncounterButton
          className="storm-mission-summary-new-encounter"
          onNewEncounter={onNewEncounter}
        />
      </div>
    </section>
  )
}

function MissionBriefingDialog({ encounter, onDismiss }) {
  const objectiveTargetIcon = <MissionObjectiveTargetIcon encounter={encounter} />

  return (
    <div className="storm-mission-overlay">
      <section
        id="storm-mission-briefing"
        className="storm-mission-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="storm-mission-briefing-title"
      >
        <p className="eyebrow">Storm Commander Alpha</p>
        <h1 id="storm-mission-briefing-title">{encounter.title}</h1>
        <p className="storm-mission-intro">{encounter.intro}</p>

        <section className="storm-objective-panel">
          <div className="storm-objective-copy">
            <h2>Objective: {getObjectiveTypeLabel(encounter.objective.type)}</h2>
            <p>{encounter.objective.text}</p>
            <p className="storm-objective-progress">{getObjectiveProgressText(encounter)}</p>
            {encounter.outcome ? <p className="storm-outcome">{encounter.outcome}</p> : null}
          </div>
          {objectiveTargetIcon}
        </section>

        <MissionStatList encounter={encounter} />

        <button
          type="button"
          className="storm-mission-dismiss"
          onClick={onDismiss}
          autoFocus
        >
          Battle
        </button>
      </section>
    </div>
  )
}

function MissionResultDialog({ encounter, onNextMission }) {
  const isVictory = encounter.status === 'won'
  const title = isVictory ? 'Objective Succeeded' : 'Objective Failed'
  const outcome = encounter.outcome || (isVictory ? 'Mission objective complete.' : 'Mission objective failed.')

  return (
    <div className="storm-result-overlay">
      <section
        className={`storm-result-dialog ${isVictory ? 'is-success' : 'is-failure'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="storm-result-title"
      >
        <p className="eyebrow">{isVictory ? 'Mission Complete' : 'Mission Failed'}</p>
        <h1 id="storm-result-title">{title}</h1>
        <p className="storm-result-outcome">{outcome}</p>
        <button
          type="button"
          className="storm-primary-button storm-result-action"
          onClick={onNextMission}
          autoFocus
        >
          Next Mission
        </button>
      </section>
    </div>
  )
}

export function StormCommanderEncounterPage({
  encounter,
  onNewEncounter,
  pieceRotation,
  setEncounter,
  starfieldLayerStyles,
}) {
  const [selection, setSelection] = useState(null)
  const [playerCommsSelection, setPlayerCommsSelection] = useState(null)
  const [opponentCommsSelection, setOpponentCommsSelection] = useState(null)
  const [dismissedMissionEncounterId, setDismissedMissionEncounterId] = useState(null)
  const [selectionFlash, setSelectionFlash] = useState(null)
  const selectionFlashIdRef = useRef(0)
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
  const isMissionResultOpen = encounter.status !== 'active'
  const isMissionBriefingOpen =
    encounter.status === 'active' && dismissedMissionEncounterId !== encounter.id

  useEffect(() => {
    if (!selectionFlash) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setSelectionFlash(null)
    }, SELECTION_FLASH_DURATION_MS)

    return () => window.clearTimeout(timerId)
  }, [selectionFlash])

  useEffect(() => {
    if (encounter.status !== 'active') {
      return
    }

    const evaluatedEncounter = evaluateEncounterStatus(encounter)

    if (evaluatedEncounter !== encounter) {
      setEncounter(evaluatedEncounter)
    }
  }, [encounter, setEncounter])

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

  function flashSelectionFaction(faction) {
    const theme = STORM_COMMANDER_FACTION_VISUAL_THEMES[faction]

    if (!theme) {
      return
    }

    selectionFlashIdRef.current += 1

    setSelectionFlash({
      color: theme.hint,
      faction,
      id: `${faction}-${selectionFlashIdRef.current}`,
    })
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
      flashSelectionFaction(piece.faction)
      setSelection({ encounterId: encounter.id, pieceId: piece.id })
      setPlayerCommsSelection({ encounterId: encounter.id, pieceId: piece.id })
    } else if (piece) {
      flashSelectionFaction(piece.faction)
      setSelection(null)
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
  const rootStyle = getEncounterRootStyle(encounter)

  return (
    <div className="game-page storm-commander-root storm-encounter-root" style={rootStyle}>
      <main className="storm-encounter-shell">
        <ShipCommsWindow
          ariaLabel="Player comms"
          board={encounter.board}
          emptyText="Select a Pirate ship to open player comms."
          piece={playerCommsPiece}
          pieceRotation={pieceRotation}
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
              const isActiveSelection = Boolean(
                selectedPiece && sameSquare(selectedPiece.square, square),
              )
              const isPlayerSoftSelection = Boolean(
                !isActiveSelection &&
                piece?.id &&
                playerCommsPiece?.id === piece.id,
              )
              const isOpponentSoftSelection = Boolean(
                piece?.id &&
                opponentCommsPiece?.id === piece.id,
              )
              const isExtraction = sameSquare(square, encounter.objective.extractionSquare)
              const isTarget =
                Boolean(encounter.objective.targetPieceId) &&
                piece?.id === encounter.objective.targetPieceId
              const className = [
                'storm-encounter-square',
                (square.x + square.y) % 2 === 0 ? 'is-light' : 'is-dark',
                isPlayerSoftSelection ? 'is-player-soft-selected' : '',
                isOpponentSoftSelection ? 'is-opponent-soft-selected' : '',
                isActiveSelection ? 'is-selected' : '',
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
                  <span className="storm-selection-ring" aria-hidden="true" />
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
          variant="opponent"
        />

        <aside className="storm-encounter-panel" aria-label="Encounter status">
          <MissionSummaryPanel
            encounter={encounter}
            isMissionBriefingOpen={isMissionBriefingOpen}
            onNewEncounter={handleNewEncounter}
            onOpenMission={() => setDismissedMissionEncounterId(null)}
          />
        </aside>
      </main>

      {selectionFlash ? (
        <div
          key={selectionFlash.id}
          className="storm-selection-flash"
          data-faction={selectionFlash.faction}
          style={{ '--storm-selection-flash-color': selectionFlash.color }}
          aria-hidden="true"
        />
      ) : null}

      {isMissionBriefingOpen ? (
        <MissionBriefingDialog
          encounter={encounter}
          onDismiss={() => setDismissedMissionEncounterId(encounter.id)}
        />
      ) : null}

      {isMissionResultOpen ? (
        <MissionResultDialog encounter={encounter} onNextMission={handleNewEncounter} />
      ) : null}
    </div>
  )
}

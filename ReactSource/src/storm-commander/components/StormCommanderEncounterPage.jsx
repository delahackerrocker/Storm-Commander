import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  STORM_COMMANDER_FACTION_PIECE_ASSETS,
  STORM_COMMANDER_FACTION_VISUAL_THEMES,
} from '../../chess/stormCommanderPieceAssets'
import { StormCommanderShipPiece } from '../../components/StormCommanderShipPiece'
import {
  advanceSloppyAggressiveTurn,
  selectSloppyAggressiveMove,
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
import { getStormCommanderHeroForPiece } from '../heroes/heroProfiles'

const ENEMY_MOVE_DELAY_MS = 1500
const ENEMY_THINKING_SELECTION_INTERVAL_MS = 500
const SELECTION_FLASH_DURATION_MS = 300
const MOVE_ANIMATION_DURATION_MS = 1200

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

const STORM_COMMANDER_PAWN_CAPTURE_HINT_SQUARES = new Set(['1,1', '3,1', '1,3', '3,3'])

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

function getRandomThinkingPieceId(pieces, currentPieceId) {
  if (pieces.length === 0) {
    return null
  }

  if (pieces.length === 1) {
    return pieces[0].id
  }

  const selectablePieces = pieces.filter((piece) => piece.id !== currentPieceId)
  const selectedIndex = Math.floor(Math.random() * selectablePieces.length)

  return selectablePieces[selectedIndex].id
}

function getBoardStyle(encounter) {
  const currentTheme = STORM_COMMANDER_FACTION_VISUAL_THEMES[encounter.currentFaction]

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
  }
}

function getEncounterRootStyle(encounter) {
  const playerTheme = STORM_COMMANDER_FACTION_VISUAL_THEMES[encounter.playerFaction]
  const opponentFaction = encounter.factions.find((faction) => faction !== encounter.playerFaction)
  const opponentTheme = STORM_COMMANDER_FACTION_VISUAL_THEMES[opponentFaction]

  return {
    ...(playerTheme
      ? {
          '--storm-player-faction-bg': playerTheme.hintSoft,
          '--storm-player-faction-stroke': playerTheme.hint,
        }
      : {}),
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

function getMoveAngle(from, to) {
  const deltaX = to.x - from.x
  const deltaY = to.y - from.y

  if (deltaX === 0 && deltaY === 0) {
    return '0deg'
  }

  return `${Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90}deg`
}

function getLegalMoveHintStyle(selectedPiece, legalMove) {
  if (!selectedPiece || !legalMove || legalMove.capturedPieceId) {
    return undefined
  }

  const moveAngle = getDegreeValue(getMoveAngle(selectedPiece.square, legalMove.to))
  const shortestMoveAngle = getShortestAngleTarget(0, moveAngle)

  return {
    '--storm-legal-move-angle': `${shortestMoveAngle}deg`,
  }
}

function getDegreeValue(rotation) {
  const parsed = Number.parseFloat(rotation)

  return Number.isFinite(parsed) ? parsed : 0
}

function getShortestAngleTarget(fromAngle, toAngle) {
  const shortestDelta = ((toAngle - fromAngle + 540) % 360) - 180

  return fromAngle + shortestDelta
}

function getMoveAnimationStyle(animation, encounter) {
  const theme = STORM_COMMANDER_FACTION_VISUAL_THEMES[animation.movingPiece.faction]
  const fromLeft = `${((animation.move.from.x + 0.5) / encounter.board.width) * 100}%`
  const fromTop = `${((animation.move.from.y + 0.5) / encounter.board.height) * 100}%`
  const toLeft = `${((animation.move.to.x + 0.5) / encounter.board.width) * 100}%`
  const toTop = `${((animation.move.to.y + 0.5) / encounter.board.height) * 100}%`
  const startAngle = getDegreeValue(animation.pieceRotation)
  const targetAngle = getDegreeValue(getMoveAngle(animation.move.from, animation.move.to))
  const shortestTargetAngle = getShortestAngleTarget(startAngle, targetAngle)

  return {
    '--storm-move-cell-width': `${100 / encounter.board.width}%`,
    '--storm-move-explosion-width': `${54 / encounter.board.width}%`,
    '--storm-move-from-left': fromLeft,
    '--storm-move-from-top': fromTop,
    '--storm-move-to-left': toLeft,
    '--storm-move-to-top': toTop,
    '--storm-move-angle': `${shortestTargetAngle}deg`,
    '--storm-move-start-angle': `${startAngle}deg`,
    '--storm-attack-color': theme?.hint || 'rgba(232, 108, 36, 0.9)',
  }
}

function MoveAnimationLayer({ animation, encounter }) {
  if (!animation) {
    return null
  }

  const isCapture = Boolean(animation.capturedPiece)

  return (
    <div
      className={`storm-capture-animation-layer ${isCapture ? 'is-capture' : 'is-quiet'}`}
      data-faction={animation.movingPiece.faction}
      style={getMoveAnimationStyle(animation, encounter)}
      aria-hidden="true"
    >
      <div className="storm-capture-attacker" data-faction={animation.movingPiece.faction}>
        <StormCommanderEncounterPiece piece={animation.movingPiece} />
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

function getMovementPatternSquares(pieceType) {
  if (pieceType === 'p') {
    return new Set(['2,1', '1,2', '3,2', '2,3', '1,1', '3,1', '1,3', '3,3'])
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

function MovementPatternIcon({ faction, pieceType }) {
  const movementSquares = getMovementPatternSquares(pieceType)
  const cells = []

  for (let y = 0; y < 5; y += 1) {
    for (let x = 0; x < 5; x += 1) {
      const squareKey = `${x},${y}`
      const isOrigin = x === 2 && y === 2
      const isMovementSquare = movementSquares.has(squareKey)
      const isPawnCaptureHint =
        pieceType === 'p' && STORM_COMMANDER_PAWN_CAPTURE_HINT_SQUARES.has(squareKey)
      if (!isOrigin && !isMovementSquare) {
        continue
      }

      const className = [
        'storm-movement-pattern-cell',
        isOrigin ? 'is-origin' : '',
        isMovementSquare ? 'is-move' : '',
        isPawnCaptureHint ? 'is-capture-hint' : '',
      ]
        .filter(Boolean)
        .join(' ')

      cells.push(
        <span
          key={`${x},${y}`}
          className={className}
          style={{ gridColumn: x + 1, gridRow: y + 1 }}
        />,
      )
    }
  }

  return (
    <div
      className="storm-movement-pattern"
      role="img"
      aria-label={STORM_COMMANDER_MOVEMENT_HINTS[pieceType]}
      data-faction={faction}
    >
      {cells}
    </div>
  )
}

function ShipCommsWindow({
  ariaLabel,
  emptyText,
  piece,
  pieceRotation,
  selectionFlash,
  variant,
}) {
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
  const heroProfile = getStormCommanderHeroForPiece(piece)
  const heroPortrait = heroProfile?.assets.portraits[0]
  const activeSelectionFlash =
    selectionFlash?.faction === piece.faction ? selectionFlash : null

  return (
    <aside
      className={`storm-comms-window storm-comms-window-${variant}`}
      aria-label={ariaLabel}
      data-faction={piece.faction}
    >
      <div
        className="storm-comms-hero-portrait"
        role="img"
        aria-label={
          heroProfile
            ? `${heroProfile.fullName} hero portrait`
            : `${factionName} hero portrait`
        }
        data-faction={piece.faction}
      >
        {heroPortrait ? (
          <img
            className="storm-comms-hero-image"
            src={heroPortrait}
            alt=""
            aria-hidden="true"
          />
        ) : null}
      </div>
      <div
        className="storm-comms-portrait"
        role="img"
        aria-label={`${pilotTitle} comms portrait`}
        data-faction={piece.faction}
      >
        <StormCommanderEncounterPiece piece={piece} pieceRotation={pieceRotation} />
      </div>
      <h2>{pilotTitle}</h2>
      <div className="storm-comms-transmission">
        <MovementPatternIcon faction={piece.faction} pieceType={piece.type} />
        <p className="storm-comms-bark">"{STORM_COMMANDER_PILOT_BARKS[piece.type]}"</p>
      </div>
      {activeSelectionFlash ? (
        <div
          key={activeSelectionFlash.id}
          className="storm-selection-flash"
          data-faction={activeSelectionFlash.faction}
          style={{ '--storm-selection-flash-color': activeSelectionFlash.color }}
          aria-hidden="true"
        />
      ) : null}
    </aside>
  )
}

function MissionStatList({ encounter }) {
  const opponentFaction =
    encounter.factions.find((faction) => faction !== encounter.playerFaction) ?? encounter.factions[0]

  return (
    <dl className="storm-encounter-stats">
      <div>
        <dt>Factions</dt>
        <dd>
          {encounter.factions.map((faction, index) => (
            <span key={faction}>
              {index > 0 ? ' / ' : null}
              <span className="storm-mission-faction-name" data-faction={faction}>
                {getFactionDisplayName(faction)}
              </span>
            </span>
          ))}
        </dd>
      </div>
      <div>
        <dt>AI</dt>
        <dd>
          <span className="storm-mission-ai-type" data-faction={opponentFaction}>
            Sloppy Aggressive
          </span>
        </dd>
      </div>
    </dl>
  )
}

function MissionStatusButton({ encounter, isMissionBriefingOpen, onOpenMission }) {
  const objectiveLabel = getObjectiveTypeLabel(encounter.objective.type)
  const progressText = getObjectiveProgressText(encounter)

  return (
    <button
      type="button"
      className="storm-mission-status-button"
      aria-label={`Mission status. Objective: ${objectiveLabel}. Progress: ${progressText}. Open mission briefing.`}
      aria-haspopup="dialog"
      aria-expanded={isMissionBriefingOpen}
      aria-controls="storm-mission-briefing"
      title={`Objective: ${objectiveLabel}. Progress: ${progressText}.`}
      onClick={onOpenMission}
    >
      Mission
    </button>
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
  getCurrentPieceRotation,
  onBack,
  onBoardAnimationsPausedChange,
  onNewEncounter,
  pieceRotation,
  setEncounter,
  showStarfieldLayers = false,
  starfieldLayerStyles,
}) {
  const [selection, setSelection] = useState(null)
  const [playerCommsSelection, setPlayerCommsSelection] = useState(null)
  const [opponentCommsSelection, setOpponentCommsSelection] = useState(null)
  const [dismissedMissionEncounterId, setDismissedMissionEncounterId] = useState(null)
  const [selectionFlash, setSelectionFlash] = useState(null)
  const [pendingMoveAnimation, setPendingMoveAnimation] = useState(null)
  const [enemyThinkingPieceSelection, setEnemyThinkingPieceSelection] = useState(null)
  const selectionFlashIdRef = useRef(0)
  const isMoveAnimating = Boolean(pendingMoveAnimation)
  const isPlayerTurn =
    encounter.status === 'active' && encounter.currentFaction === encounter.playerFaction
  const isEnemyThinking =
    encounter.status === 'active' &&
    encounter.currentFaction !== encounter.playerFaction &&
    !isMoveAnimating
  const selectedPiece =
    isPlayerTurn && selection?.encounterId === encounter.id
      ? encounter.pieces.find(
          (piece) => piece.id === selection.pieceId && piece.faction === encounter.playerFaction,
        ) || null
      : null
  const playerPieces = useMemo(
    () => encounter.pieces.filter((piece) => piece.faction === encounter.playerFaction),
    [encounter.pieces, encounter.playerFaction],
  )
  const playerCommsPiece =
    playerCommsSelection?.encounterId === encounter.id
      ? playerPieces.find((piece) => piece.id === playerCommsSelection.pieceId) ||
        getInitialCommsPiece(playerPieces, encounter.id)
      : getInitialCommsPiece(playerPieces, encounter.id)
  const opponentPieces = useMemo(
    () => encounter.pieces.filter((piece) => piece.faction !== encounter.playerFaction),
    [encounter.pieces, encounter.playerFaction],
  )
  const enemyThinkingPiece =
    isEnemyThinking && enemyThinkingPieceSelection?.encounterId === encounter.id
      ? opponentPieces.find((piece) => piece.id === enemyThinkingPieceSelection.pieceId) || null
      : null
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
    (isEnemyThinking && opponentPieces.length === 1 ? opponentPieces[0] : null) ||
    enemyThinkingPiece ||
    manuallySelectedOpponentPiece ||
    latestOpponentMovePiece ||
    opponentPieces[0] ||
    null
  const playerSoftSelectionPiece =
    playerCommsSelection?.encounterId === encounter.id
      ? playerPieces.find((piece) => piece.id === playerCommsSelection.pieceId) || null
      : null
  const opponentSoftSelectionPiece =
    !isEnemyThinking ? manuallySelectedOpponentPiece || latestOpponentMovePiece : null
  const activeOpponentPiece = isEnemyThinking
    ? enemyThinkingPiece || opponentPieces[0] || null
    : null
  const legalMoves = useMemo(
    () =>
      selectedPiece && encounter.currentFaction === encounter.playerFaction
        ? getLegalEncounterMoves(encounter, selectedPiece.id)
        : [],
    [encounter, selectedPiece],
  )
  const isMissionResultOpen = encounter.status !== 'active'
  const isMissionBriefingOpen =
    encounter.status === 'active' && dismissedMissionEncounterId !== encounter.id

  const startMoveAnimation = useCallback((move) => {
    const movingPiece = encounter.pieces.find((piece) => piece.id === move.pieceId)
    const capturedPiece = move.capturedPieceId
      ? encounter.pieces.find((piece) => piece.id === move.capturedPieceId)
      : null

    if (movingPiece) {
      setPendingMoveAnimation({
        capturedPiece: capturedPiece ? { ...capturedPiece } : null,
        move,
        movingPiece: { ...movingPiece },
        pieceRotation: getCurrentPieceRotation?.() || pieceRotation || '0deg',
      })
    } else {
      setEncounter((currentEncounter) => applyEncounterMove(currentEncounter, move))
      setSelection(null)
    }
  }, [encounter.pieces, getCurrentPieceRotation, pieceRotation, setEncounter])

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
    if (!pendingMoveAnimation) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setEncounter((currentEncounter) =>
        applyEncounterMove(currentEncounter, pendingMoveAnimation.move),
      )
      setSelection(null)
      setPendingMoveAnimation(null)
    }, MOVE_ANIMATION_DURATION_MS)

    return () => window.clearTimeout(timerId)
  }, [pendingMoveAnimation, setEncounter])

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
    if (!isEnemyThinking || opponentPieces.length <= 1) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      setEnemyThinkingPieceSelection((currentSelection) => {
        const currentPieceId =
          currentSelection?.encounterId === encounter.id
            ? currentSelection.pieceId
            : opponentPieces[0].id

        return {
          encounterId: encounter.id,
          pieceId: getRandomThinkingPieceId(opponentPieces, currentPieceId),
        }
      })
    }, ENEMY_THINKING_SELECTION_INTERVAL_MS)

    return () => window.clearInterval(timerId)
  }, [encounter.id, isEnemyThinking, opponentPieces])

  useEffect(() => {
    if (!isEnemyThinking) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      const selectedMove = selectSloppyAggressiveMove(encounter, encounter.currentFaction)

      if (selectedMove) {
        startMoveAnimation(selectedMove)
      } else {
        setEncounter((currentEncounter) => advanceSloppyAggressiveTurn(currentEncounter))
      }
    }, ENEMY_MOVE_DELAY_MS)

    return () => window.clearTimeout(timerId)
  }, [encounter, isEnemyThinking, setEncounter, startMoveAnimation])

  useEffect(() => {
    onBoardAnimationsPausedChange?.(isMissionBriefingOpen)
  }, [isMissionBriefingOpen, onBoardAnimationsPausedChange])

  useEffect(() => () => {
    onBoardAnimationsPausedChange?.(false)
  }, [onBoardAnimationsPausedChange])

  const handleBattleStart = useCallback(() => {
    const initialPlayerPiece = getInitialCommsPiece(playerPieces, encounter.id)
    const initialOpponentPiece = opponentPieces[0] || null

    if (initialPlayerPiece) {
      setPlayerCommsSelection({ encounterId: encounter.id, pieceId: initialPlayerPiece.id })
    }

    if (initialOpponentPiece) {
      setOpponentCommsSelection({
        encounterId: encounter.id,
        latestOpponentMovePieceId,
        pieceId: initialOpponentPiece.id,
      })
    }

    onBoardAnimationsPausedChange?.(false)
    setDismissedMissionEncounterId(encounter.id)
  }, [
    encounter.id,
    latestOpponentMovePieceId,
    onBoardAnimationsPausedChange,
    opponentPieces,
    playerPieces,
  ])

  useEffect(() => {
    if (!isMissionBriefingOpen) {
      return undefined
    }

    function handleMissionKeyDown(event) {
      if (event.key === 'Escape') {
        handleBattleStart()
      }
    }

    window.addEventListener('keydown', handleMissionKeyDown)

    return () => window.removeEventListener('keydown', handleMissionKeyDown)
  }, [handleBattleStart, isMissionBriefingOpen])

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
    if (
      isMoveAnimating ||
      encounter.status !== 'active' ||
      encounter.currentFaction !== encounter.playerFaction
    ) {
      return
    }

    const selectedMove = legalMoves.find((move) => sameSquare(move.to, square))

    if (selectedMove) {
      startMoveAnimation(selectedMove)
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

  const rootClassName = [
    'game-page',
    'storm-commander-root',
    'storm-encounter-root',
    isMissionBriefingOpen ? 'is-mission-briefing-open' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={rootClassName} style={rootStyle}>
      <div className="play-controls storm-encounter-panel" aria-label="Play controls">
        {onBack && !isMissionResultOpen ? (
          <button type="button" className="back-button" onClick={onBack}>
            Back
          </button>
        ) : null}
        <MissionStatusButton
          encounter={encounter}
          isMissionBriefingOpen={isMissionBriefingOpen}
          onOpenMission={() => setDismissedMissionEncounterId(null)}
        />
      </div>

      <main className="storm-encounter-shell">
        <ShipCommsWindow
          ariaLabel="Player comms"
          emptyText="Select a Pirate ship to open player comms."
          piece={playerCommsPiece}
          pieceRotation={pieceRotation}
          selectionFlash={selectionFlash}
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
            {showStarfieldLayers || starfieldLayerStyles ? (
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

            {squares.map((square) => {
              const piece = getEncounterPieceAt(encounter, square)
              const legalMove = legalMoveForSquare.get(`${square.x},${square.y}`)
              const isActiveSelection = Boolean(
                (!isMoveAnimating && selectedPiece && sameSquare(selectedPiece.square, square)) ||
                  (activeOpponentPiece && sameSquare(activeOpponentPiece.square, square)),
              )
              const isPlayerSoftSelection = Boolean(
                !isActiveSelection &&
                  piece?.id &&
                  playerSoftSelectionPiece?.id === piece.id,
              )
              const isOpponentSoftSelection = Boolean(
                !isActiveSelection &&
                  piece?.id &&
                  opponentSoftSelectionPiece?.id === piece.id,
              )
              const isExtraction = sameSquare(square, encounter.objective.extractionSquare)
              const isTarget =
                Boolean(encounter.objective.targetPieceId) &&
                piece?.id === encounter.objective.targetPieceId
              const isMoveAnimationFrom = Boolean(
                pendingMoveAnimation && sameSquare(pendingMoveAnimation.move.from, square),
              )
              const isMoveAnimationTo = Boolean(
                pendingMoveAnimation && sameSquare(pendingMoveAnimation.move.to, square),
              )
              const isMoveAnimationCaptureTo = Boolean(
                isMoveAnimationTo && pendingMoveAnimation?.move.capturedPieceId,
              )
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
                isMoveAnimationFrom ? 'is-move-animation-from' : '',
                isMoveAnimationTo ? 'is-move-animation-to' : '',
                isMoveAnimationCaptureTo ? 'is-move-animation-capture-to' : '',
              ]
                .filter(Boolean)
                .join(' ')
              const actionLabel = legalMove?.capturedPieceId
                ? 'capture destination'
                : legalMove
                  ? 'legal destination'
                  : 'square'
              const legalMoveHintStyle = getLegalMoveHintStyle(selectedPiece, legalMove)

              return (
                <button
                  key={`${square.x},${square.y}`}
                  type="button"
                  className={className}
                  data-testid="storm-encounter-square"
                  data-faction={piece?.faction}
                  style={legalMoveHintStyle}
                  disabled={isMoveAnimating}
                  aria-label={`${getSquareLabel(square, encounter.board)} ${getEncounterPieceLabel(piece)} ${actionLabel}`}
                  onClick={() => handleSquareClick(square)}
                >
                  <span className="storm-selection-ring" aria-hidden="true" />
                  <StormCommanderEncounterPiece piece={piece} pieceRotation={pieceRotation} />
                </button>
              )
            })}
            <MoveAnimationLayer
              animation={pendingMoveAnimation}
              encounter={encounter}
            />
          </div>
        </section>

        <ShipCommsWindow
          ariaLabel="Opponent comms"
          emptyText="Touch an opponent ship to scan their comms."
          piece={opponentCommsPiece}
          pieceRotation={pieceRotation}
          selectionFlash={selectionFlash}
          variant="opponent"
        />

      </main>

      {isMissionBriefingOpen ? (
        <MissionBriefingDialog
          encounter={encounter}
          onDismiss={handleBattleStart}
        />
      ) : null}

      {isMissionResultOpen ? (
        <MissionResultDialog encounter={encounter} onNextMission={handleNewEncounter} />
      ) : null}
    </div>
  )
}

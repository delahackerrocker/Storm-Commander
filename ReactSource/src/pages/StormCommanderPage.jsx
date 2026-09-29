import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRandomSideFactions } from '../chess/stormCommanderFactions'
import {
  STORM_COMMANDER_STARFIELD_TICK_MS,
  advanceStarfieldMotion,
  createInitialStarfieldMotion,
  toStarfieldStyle,
} from '../chess/stormCommanderStarfield'
import {
  STORM_COMMANDER_FACTION_VISUAL_THEMES,
} from '../chess/stormCommanderPieceAssets'
import { StormCommanderMission } from '../storm-commander/components/StormCommanderMission'
import { generateRandomEncounter } from '../storm-commander/encounter/generateRandomEncounter'
import { configureEncounterDifficulty } from '../storm-commander/difficulty/difficultySettings'
import { getDifficultySettings, recordDifficultyResult } from '../storm-commander/difficulty/useDifficultySettings'
import { BasicChessPage } from './BasicChessPage'
import '../styles/stormCommander.css'

function createSideVisualThemes(sideFactions) {
  return {
    w: STORM_COMMANDER_FACTION_VISUAL_THEMES[sideFactions.w],
    b: STORM_COMMANDER_FACTION_VISUAL_THEMES[sideFactions.b],
  }
}

const MAX_STARFIELD_ELAPSED_MS = STORM_COMMANDER_STARFIELD_TICK_MS * 3

function getCurrentTimeMs() {
  return window.performance?.now?.() ?? Date.now()
}

function applyStarfieldStyle(element, starfieldMotion) {
  const nextStyle = toStarfieldStyle(starfieldMotion)

  for (const [propertyName, value] of Object.entries(nextStyle)) {
    element.style.setProperty(propertyName, value)
  }
}

function useLowPowerStarfieldMotion(isPaused = false) {
  const [initialStarfieldMotion] = useState(() => createInitialStarfieldMotion())
  const starfieldRootRef = useRef(null)
  const starfieldMotionRef = useRef(initialStarfieldMotion)
  const pieceRotationRef = useRef(initialStarfieldMotion.pieceRotation)
  const initialStarfieldStyle = useMemo(
    () => toStarfieldStyle(initialStarfieldMotion),
    [initialStarfieldMotion],
  )
  const getCurrentPieceRotation = useCallback(() => pieceRotationRef.current, [])

  useEffect(() => {
    const rootElement = starfieldRootRef.current

    if (!rootElement) {
      return undefined
    }

    let timerId = null
    let lastTickTime = getCurrentTimeMs()

    function clearStarfieldTimer() {
      if (timerId !== null) {
        window.clearInterval(timerId)
        timerId = null
      }
    }

    function advanceStarfield() {
      const now = getCurrentTimeMs()
      const elapsedMs = Math.min(
        MAX_STARFIELD_ELAPSED_MS,
        Math.max(STORM_COMMANDER_STARFIELD_TICK_MS, now - lastTickTime),
      )
      const nextMotion = advanceStarfieldMotion(
        starfieldMotionRef.current,
        Math.random,
        elapsedMs,
      )

      lastTickTime = now
      starfieldMotionRef.current = nextMotion
      pieceRotationRef.current = nextMotion.pieceRotation
      applyStarfieldStyle(rootElement, nextMotion)
    }

    function startStarfieldTimer({ advanceImmediately = true } = {}) {
      clearStarfieldTimer()

      if (isPaused || document.hidden) {
        return
      }

      if (advanceImmediately) {
        advanceStarfield()
      }

      timerId = window.setInterval(
        advanceStarfield,
        STORM_COMMANDER_STARFIELD_TICK_MS,
      )
    }

    function handleVisibilityChange() {
      if (isPaused || document.hidden) {
        clearStarfieldTimer()
        return
      }

      lastTickTime = getCurrentTimeMs()
      advanceStarfield()
      startStarfieldTimer({ advanceImmediately: false })
    }

    applyStarfieldStyle(rootElement, starfieldMotionRef.current)
    startStarfieldTimer()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearStarfieldTimer()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isPaused])

  return {
    getCurrentPieceRotation,
    initialStarfieldStyle,
    starfieldRootRef,
  }
}

export function StormCommanderPage({
  allowChessDrill = true,
  chessTitle = 'Storm Commander',
  onBack,
  startInRandomEncounter = false,
  radioInputUnlockAt = 0,
}) {
  const [sideFactions, setSideFactions] = useState(() => createRandomSideFactions())
  const [encounter, setEncounter] = useState(() =>
    startInRandomEncounter ? configureEncounterDifficulty(generateRandomEncounter(), getDifficultySettings()) : null,
  )
  const [areBoardAnimationsPaused, setAreBoardAnimationsPaused] = useState(false)
  const { getCurrentPieceRotation, initialStarfieldStyle, starfieldRootRef } =
    useLowPowerStarfieldMotion(areBoardAnimationsPaused)
  const sideVisualThemes = useMemo(() => createSideVisualThemes(sideFactions), [sideFactions])

  useEffect(() => {
    if (encounter) recordDifficultyResult(encounter)
  }, [encounter])

  const handleBoardAnimationsPausedChange = useCallback((isPaused) => {
    setAreBoardAnimationsPaused(isPaused)
  }, [])

  function randomizeSideFactions() {
    setSideFactions((currentSideFactions) =>
      createRandomSideFactions(Math.random, currentSideFactions),
    )
  }

  function startRandomEncounter() {
    // Record once here too, so a fast Next Mission tap cannot race the result effect.
    if (encounter) recordDifficultyResult(encounter)
    setEncounter(configureEncounterDifficulty(generateRandomEncounter(), getDifficultySettings()))
  }

  return (
    <div
      ref={starfieldRootRef}
      className="storm-commander-effects"
      style={initialStarfieldStyle}
    >
      {encounter ? (
        <StormCommanderMission
          key={encounter.id}
          radioInputUnlockAt={radioInputUnlockAt}
          encounter={encounter}
          getCurrentPieceRotation={getCurrentPieceRotation}
          onBack={onBack}
          onBoardAnimationsPausedChange={handleBoardAnimationsPausedChange}
          onNewEncounter={startRandomEncounter}
          onReturnToChess={allowChessDrill ? () => setEncounter(null) : undefined}
          setEncounter={setEncounter}
          showStarfieldLayers
        />
      ) : (
        <BasicChessPage
          enableStormBoardEffects
          extrasPlacement="below"
          getCurrentPieceRotation={getCurrentPieceRotation}
          onBack={onBack}
          onNewGameVisuals={randomizeSideFactions}
          pieceSet="storm-commander-png"
          rootClassName="storm-commander-root storm-encounter-root storm-debug-chess-root"
          sidePieceFactions={sideFactions}
          sideVisualThemes={sideVisualThemes}
          showStarfieldLayers
          title={chessTitle}
          topControls={allowChessDrill ? (
            <button type="button" className="storm-primary-button" onClick={startRandomEncounter}>
              New Random Encounter
            </button>
          ) : null}
        />
      )}
    </div>
  )
}

import { FILES } from './squareUtils'
import { STORM_COMMANDER_FACTION_VISUAL_THEMES } from './stormCommanderPieceAssets'

export const STORM_CHESS_MOVE_ANIMATION_DURATION_MS = 1200

function getDegreeValue(rotation) {
  const parsed = Number.parseFloat(rotation)

  return Number.isFinite(parsed) ? parsed : 0
}

function getShortestAngleTarget(fromAngle, toAngle) {
  const shortestDelta = ((toAngle - fromAngle + 540) % 360) - 180

  return fromAngle + shortestDelta
}

export function squareToStormBoardPoint(square) {
  return {
    x: FILES.indexOf(square[0]),
    y: 8 - Number(square[1]),
  }
}

export function getStormMoveAngle(fromSquare, toSquare) {
  const from = squareToStormBoardPoint(fromSquare)
  const to = squareToStormBoardPoint(toSquare)
  const deltaX = to.x - from.x
  const deltaY = to.y - from.y

  if (deltaX === 0 && deltaY === 0) {
    return '0deg'
  }

  return `${Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90}deg`
}

export function getStormLegalMoveHintStyle(selectedSquare, legalMove) {
  if (!selectedSquare || !legalMove || legalMove.captured) {
    return undefined
  }

  const moveAngle = getDegreeValue(getStormMoveAngle(selectedSquare, legalMove.to))
  const shortestMoveAngle = getShortestAngleTarget(0, moveAngle)

  return {
    '--storm-legal-move-angle': `${shortestMoveAngle}deg`,
  }
}

export function getStormChessMoveAnimationStyle(animation) {
  const from = squareToStormBoardPoint(animation.move.from)
  const to = squareToStormBoardPoint(animation.move.to)
  const fromLeft = `${((from.x + 0.5) / 8) * 100}%`
  const fromTop = `${((from.y + 0.5) / 8) * 100}%`
  const toLeft = `${((to.x + 0.5) / 8) * 100}%`
  const toTop = `${((to.y + 0.5) / 8) * 100}%`
  const startAngle = getDegreeValue(animation.pieceRotation)
  const targetAngle = getDegreeValue(getStormMoveAngle(animation.move.from, animation.move.to))
  const shortestTargetAngle = getShortestAngleTarget(startAngle, targetAngle)
  const theme = STORM_COMMANDER_FACTION_VISUAL_THEMES[animation.faction]

  return {
    '--storm-move-cell-width': `${100 / 8}%`,
    '--storm-move-explosion-width': `${54 / 8}%`,
    '--storm-move-from-left': fromLeft,
    '--storm-move-from-top': fromTop,
    '--storm-move-to-left': toLeft,
    '--storm-move-to-top': toTop,
    '--storm-move-angle': `${shortestTargetAngle}deg`,
    '--storm-move-start-angle': `${startAngle}deg`,
    '--storm-attack-color': theme?.hint || 'rgba(232, 108, 36, 0.9)',
  }
}

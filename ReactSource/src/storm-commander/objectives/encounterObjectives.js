function sameSquare(left, right) {
  return left?.x === right?.x && left?.y === right?.y
}

function hasPlayerPieces(encounter) {
  return encounter.pieces.some((piece) => piece.faction === encounter.playerFaction)
}

function hasFactionPieces(encounter, faction) {
  return encounter.pieces.some((piece) => piece.faction === faction)
}

function complete(encounter) {
  return {
    ...encounter,
    status: 'won',
    outcome: 'Victory: objective complete.',
  }
}

function fail(encounter, outcome = 'All Pirate ships lost.') {
  return {
    ...encounter,
    status: 'lost',
    outcome,
  }
}

export function evaluateEncounterStatus(encounter) {
  if (encounter.status && encounter.status !== 'active') {
    return encounter
  }

  if (!hasPlayerPieces(encounter)) {
    return fail(encounter)
  }

  if (encounter.objective?.type === 'destroyTarget') {
    const targetAlive = encounter.pieces.some(
      (piece) => piece.id === encounter.objective.targetPieceId,
    )

    return targetAlive ? encounter : complete(encounter)
  }

  if (encounter.objective?.type === 'surviveTurns') {
    return encounter.objective.turnsElapsed >= encounter.objective.turnsRequired
      ? complete(encounter)
      : encounter
  }

  if (encounter.objective?.type === 'escapeToSquare') {
    const escaped = encounter.pieces.some(
      (piece) =>
        piece.faction === encounter.playerFaction &&
        sameSquare(piece.square, encounter.objective.extractionSquare),
    )

    return escaped ? complete(encounter) : encounter
  }

  if (encounter.objective?.type === 'captureValue') {
    return encounter.capturedValueByPlayer >= encounter.objective.valueRequired
      ? complete(encounter)
      : encounter
  }

  return encounter
}

export function advanceEncounterTurn(encounter) {
  if (!encounter.turnOrder?.length || !encounter.currentFaction) {
    return encounter
  }

  const currentIndex = Math.max(encounter.turnOrder.indexOf(encounter.currentFaction), 0)
  let nextIndex = currentIndex
  let wrappedToPlayer = false

  for (let attempt = 0; attempt < encounter.turnOrder.length; attempt += 1) {
    nextIndex = (nextIndex + 1) % encounter.turnOrder.length
    const nextFaction = encounter.turnOrder[nextIndex]

    if (nextFaction === encounter.playerFaction) {
      wrappedToPlayer = true
    }

    if (hasFactionPieces(encounter, nextFaction)) {
      const nextObjective =
        wrappedToPlayer && encounter.objective?.type === 'surviveTurns'
          ? {
              ...encounter.objective,
              turnsElapsed: encounter.objective.turnsElapsed + 1,
            }
          : encounter.objective

      return {
        ...encounter,
        currentFaction: nextFaction,
        round: wrappedToPlayer ? (encounter.round || 1) + 1 : encounter.round || 1,
        objective: nextObjective,
      }
    }
  }

  return encounter
}

export function applyEncounterMove(encounter, move) {
  const movingPiece = encounter.pieces.find((piece) => piece.id === move.pieceId)

  if (!movingPiece) {
    return encounter
  }

  const capturedPiece = move.capturedPieceId
    ? encounter.pieces.find((piece) => piece.id === move.capturedPieceId)
    : null
  const capturedValue = capturedPiece ? move.capturedValue || 0 : 0
  const capturedValueByPlayer =
    movingPiece.faction === encounter.playerFaction
      ? (encounter.capturedValueByPlayer || 0) + capturedValue
      : encounter.capturedValueByPlayer || 0
  const pieces = encounter.pieces
    .filter((piece) => piece.id !== move.capturedPieceId)
    .map((piece) =>
      piece.id === move.pieceId
        ? {
            ...piece,
            square: { ...move.to },
          }
        : piece,
    )
  const movedEncounter = {
    ...encounter,
    pieces,
    capturedValueByPlayer,
    lastMove: {
      ...move,
      faction: movingPiece.faction,
      capturedPiece: capturedPiece ? { ...capturedPiece } : null,
    },
  }

  return evaluateEncounterStatus(advanceEncounterTurn(movedEncounter))
}

export function getObjectiveProgressText(encounter) {
  if (!encounter.objective) {
    return 'No objective loaded.'
  }

  if (encounter.objective.type === 'surviveTurns') {
    return `${encounter.objective.turnsElapsed}/${encounter.objective.turnsRequired} turns survived`
  }

  if (encounter.objective.type === 'captureValue') {
    return `${encounter.capturedValueByPlayer}/${encounter.objective.valueRequired} value captured`
  }

  if (encounter.objective.type === 'escapeToSquare') {
    const { x, y } = encounter.objective.extractionSquare
    return `Extraction at ${x + 1},${y + 1}`
  }

  return 'Target must be destroyed.'
}

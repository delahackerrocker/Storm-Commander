import {
  STORM_COMMANDER_BOARD_SIZES,
  STORM_COMMANDER_ENEMY_FACTIONS,
  STORM_COMMANDER_OBJECTIVE_TYPES,
  STORM_COMMANDER_PIECE_VALUES,
  STORM_COMMANDER_PLAYER_FACTION,
  getEncounterPieceLabel,
  getFactionDisplayName,
} from '../tactics/encounterConstants'

const ENCOUNTER_PROFILES = [
  {
    pirateBudget: [5, 7],
    enemyBudget: [5, 8],
  },
  {
    pirateBudget: [8, 10],
    enemyBudget: [8, 12],
  },
  {
    pirateBudget: [8, 12],
    enemyBudget: [12, 16],
  },
]

function randomIndex(length, random) {
  return Math.min(Math.floor(random() * length), length - 1)
}

function randomInt([min, max], random) {
  return min + randomIndex(max - min + 1, random)
}

function takeRandomItems(items, count, random) {
  const available = [...items]
  const selected = []

  while (selected.length < count && available.length > 0) {
    const index = randomIndex(available.length, random)
    selected.push(available[index])
    available.splice(index, 1)
  }

  return selected
}

function buildBudgetPieces(faction, budget) {
  const pattern = ['q', 'r', 'n', 'b', 'p', 'p', 'p', 'p', 'p', 'k']
  const pieces = []
  let remainingBudget = budget

  for (const type of pattern) {
    const value = STORM_COMMANDER_PIECE_VALUES[type]

    if (value <= remainingBudget) {
      pieces.push({
        id: `${faction}_${type}_${pieces.length + 1}`,
        faction,
        type,
      })
      remainingBudget -= value
    }
  }

  while (remainingBudget >= STORM_COMMANDER_PIECE_VALUES.p) {
    pieces.push({
      id: `${faction}_p_${pieces.length + 1}`,
      faction,
      type: 'p',
    })
    remainingBudget -= STORM_COMMANDER_PIECE_VALUES.p
  }

  return pieces
}

function splitBudget(totalBudget, factionCount) {
  const baseBudget = Math.floor(totalBudget / factionCount)
  let remainder = totalBudget % factionCount

  return Array.from({ length: factionCount }, () => {
    const extra = remainder > 0 ? 1 : 0
    remainder -= extra
    return baseBudget + extra
  })
}

function squareKey(square) {
  return `${square.x},${square.y}`
}

function chooseEmptySquare(board, occupiedSquares, random) {
  const squareCount = board.width * board.height
  const startIndex = randomIndex(squareCount, random)

  for (let offset = 0; offset < squareCount; offset += 1) {
    const index = (startIndex + offset) % squareCount
    const square = {
      x: index % board.width,
      y: Math.floor(index / board.width),
    }

    if (!occupiedSquares.has(squareKey(square))) {
      occupiedSquares.add(squareKey(square))
      return square
    }
  }

  throw new Error('No empty squares available for generated encounter.')
}

function placePieces(board, pieces, random) {
  const occupiedSquares = new Set()

  return pieces.map((piece) => ({
    ...piece,
    square: chooseEmptySquare(board, occupiedSquares, random),
  }))
}

function chooseEdgeSquare(board, random) {
  const edgeSquares = []

  for (let x = 0; x < board.width; x += 1) {
    edgeSquares.push({ x, y: 0 })
    edgeSquares.push({ x, y: board.height - 1 })
  }

  for (let y = 1; y < board.height - 1; y += 1) {
    edgeSquares.push({ x: 0, y })
    edgeSquares.push({ x: board.width - 1, y })
  }

  return edgeSquares[randomIndex(edgeSquares.length, random)]
}

function createObjective(encounter, random) {
  const type = STORM_COMMANDER_OBJECTIVE_TYPES[randomIndex(STORM_COMMANDER_OBJECTIVE_TYPES.length, random)]
  const enemyPieces = encounter.pieces.filter((piece) => piece.faction !== encounter.playerFaction)

  if (type === 'destroyTarget') {
    const target = enemyPieces[randomIndex(enemyPieces.length, random)]

    return {
      type,
      targetPieceId: target.id,
      text: `Destroy the ${getEncounterPieceLabel(target)}.`,
    }
  }

  if (type === 'surviveTurns') {
    const turnsRequired = 4 + randomIndex(4, random)

    return {
      type,
      turnsRequired,
      turnsElapsed: 0,
      text: `Survive ${turnsRequired} turns until the jump drive charges.`,
    }
  }

  if (type === 'escapeToSquare') {
    return {
      type,
      extractionSquare: chooseEdgeSquare(encounter.board, random),
      text: 'Move any Pirate ship to the extraction square.',
    }
  }

  return {
    type: 'captureValue',
    valueRequired: 3 + randomIndex(4, random),
    text: 'Capture enough enemy ships to break their formation.',
  }
}

function createIntro(enemyFactions) {
  const enemyNames = enemyFactions.map(getFactionDisplayName)

  if (enemyNames.length === 1) {
    return `Commander, ${enemyNames[0]} signatures just dropped out of slipspace.`
  }

  if (enemyNames.length === 2) {
    return `${enemyNames[0]} is already here. Looks like ${enemyNames[1]} wants the cargo too.`
  }

  return 'Multiple transponders detected. This raid just got crowded.'
}

export function generateRandomEncounter(random = Math.random) {
  const boardSize = STORM_COMMANDER_BOARD_SIZES[randomIndex(STORM_COMMANDER_BOARD_SIZES.length, random)]
  const enemyFactions = takeRandomItems(STORM_COMMANDER_ENEMY_FACTIONS, 1, random)
  const profile = ENCOUNTER_PROFILES[randomIndex(ENCOUNTER_PROFILES.length, random)]
  const pirateBudget = randomInt(profile.pirateBudget, random)
  const enemyBudget = randomInt(profile.enemyBudget, random)
  const enemyBudgets = splitBudget(enemyBudget, enemyFactions.length)
  const board = {
    width: boardSize,
    height: boardSize,
  }
  const unplacedPieces = [
    ...buildBudgetPieces(STORM_COMMANDER_PLAYER_FACTION, pirateBudget),
    ...enemyFactions.flatMap((faction, index) => buildBudgetPieces(faction, enemyBudgets[index])),
  ]
  const pieces = placePieces(board, unplacedPieces, random)
  const encounterBase = {
    id: `generated_${Date.now().toString(36)}_${Math.floor(random() * 100000).toString(36)}`,
    title: 'Random Pirate Raid',
    board,
    factions: [STORM_COMMANDER_PLAYER_FACTION, ...enemyFactions],
    playerFaction: STORM_COMMANDER_PLAYER_FACTION,
    turnOrder: [STORM_COMMANDER_PLAYER_FACTION, ...enemyFactions],
    currentFaction: STORM_COMMANDER_PLAYER_FACTION,
    round: 1,
    intro: createIntro(enemyFactions),
    pieces,
    capturedValueByPlayer: 0,
    status: 'active',
    outcome: null,
  }

  return {
    ...encounterBase,
    objective: createObjective(encounterBase, random),
  }
}

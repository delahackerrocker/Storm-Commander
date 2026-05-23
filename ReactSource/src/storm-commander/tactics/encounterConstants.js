export const STORM_COMMANDER_PLAYER_FACTION = 'pirate'

export const STORM_COMMANDER_ENEMY_FACTIONS = ['imperial', 'robocorp', 'rebel']

export const STORM_COMMANDER_BOARD_SIZES = [5, 6, 7, 8]

export const STORM_COMMANDER_PIECE_VALUES = {
  p: 1,
  b: 2,
  n: 2,
  r: 2,
  q: 4,
  k: 4,
}

export const STORM_COMMANDER_PIECE_NAMES = {
  p: 'pawn',
  b: 'bishop',
  n: 'knight',
  r: 'rook',
  q: 'queen',
  k: 'king',
}

export const STORM_COMMANDER_MOVEMENT_HINTS = {
  p: 'Moves one square vertically or horizontally. Captures diagonally.',
  b: 'Moves diagonally until blocked.',
  n: 'Jumps in an L-shape.',
  r: 'Moves in straight lines until blocked.',
  q: 'Moves in any straight or diagonal line until blocked.',
  k: 'Moves one square in any direction.',
}

export const STORM_COMMANDER_PILOT_BARKS = {
  p: 'Tiny engine, loud heart. I can slip through.',
  b: 'Give me a clean diagonal and I will make it sing.',
  n: 'I do not fly straight. That is the point.',
  r: 'Point me at something expensive.',
  q: 'Open space belongs to us.',
  k: 'Keep the bridge intact and I will keep us breathing.',
}

export const STORM_COMMANDER_OBJECTIVE_TYPES = [
  'destroyTarget',
  'surviveTurns',
  'escapeToSquare',
  'captureValue',
]

export function getFactionDisplayName(faction) {
  if (!faction) {
    return 'Unknown'
  }

  return faction[0].toUpperCase() + faction.slice(1)
}

export function getPieceDisplayName(type) {
  return STORM_COMMANDER_PIECE_NAMES[type] || 'piece'
}

export function getEncounterPieceLabel(piece) {
  if (!piece) {
    return 'empty'
  }

  return `${getFactionDisplayName(piece.faction)} ${getPieceDisplayName(piece.type)}`
}

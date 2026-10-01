import { getInitialCommsPiece } from '../comms/openingRadio'
import { getStormCommanderHeroForPiece } from '../heroes/heroProfiles'

export const DIFFICULTY_OPTIONS = [
  { id: 'standard', name: 'Standard', description: 'A steady challenge with consistent enemy skill.' },
  { id: 'commanders', name: 'Commander Styles', description: 'Distinct commanders. Rebels are gentler; Imperials are tougher. Tactics fit the mission.' },
  { id: 'adaptive', name: 'Adaptive', description: 'Commander styles that gently get harder as you win and ease off when you lose.' },
]
export const MAX_ADAPTIVE_LEVEL = 8
export const DIFFICULTY_STORAGE_KEY = 'storm-commander-difficulty-v1'
export const DEFAULT_DIFFICULTY = { mode: 'adaptive', level: 0, completedIds: [] }

// Authored once per character; never rerolled when a ship moves or is destroyed.
export const COMMANDER_STYLES = {
  'prank-sumatra': 'bold',
  'captain-lilith-haraway': 'measured',
  'admiral-bishop-john-trace': 'bold',
  'sister-mary-wren': 'measured',
  'dayna-scry': 'measured',
  'fenris-scry': 'bold',
  'lance-rosenthorn': 'bold',
  'thalia-mott': 'measured',
}

export function normalizeDifficulty(value) {
  return {
    mode: DIFFICULTY_OPTIONS.some(option => option.id === value?.mode) ? value.mode : DEFAULT_DIFFICULTY.mode,
    level: Number.isFinite(value?.level) ? Math.max(0, Math.min(MAX_ADAPTIVE_LEVEL, Math.floor(value.level))) : 0,
    completedIds: Array.isArray(value?.completedIds) ? value.completedIds.filter(id => typeof id === 'string').slice(-32) : [],
  }
}

export function difficultyAfterResult(settings, encounter) {
  if (encounter.difficulty?.mode !== 'adaptive' || !['won', 'lost'].includes(encounter.status) ||
    !encounter.id || settings.completedIds.includes(encounter.id)) return settings
  return normalizeDifficulty({
    ...settings,
    level: settings.level + (encounter.status === 'won' ? 1 : -2),
    completedIds: [...settings.completedIds, encounter.id],
  })
}

export function configureEncounterDifficulty(encounter, settings = DEFAULT_DIFFICULTY) {
  const enemy = encounter.pieces.filter(piece => piece.faction !== encounter.playerFaction)
  const speaker = enemy.find(piece => piece.id === encounter.objective.targetPieceId) || getInitialCommsPiece(enemy, encounter.id)
  const normalized = normalizeDifficulty(settings)
  return {
    ...encounter,
    enemyCommanderId: getStormCommanderHeroForPiece(speaker)?.id,
    difficulty: { mode: normalized.mode, level: normalized.mode === 'adaptive' ? normalized.level : 0 },
  }
}

export function getCommanderTactics(encounter) {
  const mode = encounter.difficulty?.mode || 'standard'
  if (mode === 'standard') return { name: 'Standard', riskWeight: 0.65, pressure: 0, variety: 0.25 }
  const faction = encounter.pieces.find(piece => piece.faction !== encounter.playerFaction)?.faction
  const skill = ({ rebel: 0, robocorp: 0.12, imperial: 0.24 }[faction] || 0) +
    (mode === 'adaptive' ? normalizeDifficulty(encounter.difficulty).level * 0.03 : 0)
  const measured = COMMANDER_STYLES[encounter.enemyCommanderId] === 'measured'
  const guarding = ['destroyTarget', 'captureValue'].includes(encounter.objective?.type)
  return {
    name: guarding ? (measured ? 'Careful defender' : 'Counterattacker') : (measured ? 'Calculated hunter' : 'Relentless hunter'),
    riskWeight: (guarding ? (measured ? 0.85 : 0.72) : (measured ? 0.7 : 0.58)) + skill * 0.4,
    pressure: guarding ? 0 : (measured ? 0.18 : 0.24) + skill * 0.15,
    variety: Math.max(0.08, 0.25 - skill * 0.3),
  }
}

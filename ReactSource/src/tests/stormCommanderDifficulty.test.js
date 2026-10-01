import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureEncounterDifficulty, DEFAULT_DIFFICULTY, difficultyAfterResult, getCommanderTactics, normalizeDifficulty } from '../storm-commander/difficulty/difficultySettings'
import { chooseDifficulty, getDifficultySettings, recordDifficultyResult } from '../storm-commander/difficulty/useDifficultySettings'
import { generateRandomEncounter } from '../storm-commander/encounter/generateRandomEncounter'
import { buildOpeningRadio } from '../storm-commander/comms/openingRadio'

beforeEach(() => {
  const values = new Map()
  vi.stubGlobal('localStorage', { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) })
})
afterEach(() => vi.unstubAllGlobals())

describe('saved difficulty and gentle adaptation', () => {
  it('defaults to Adaptive and safely repairs invalid saved settings', () => {
    expect(getDifficultySettings()).toEqual({ mode: 'adaptive', level: 0, completedIds: [] })
    expect(normalizeDifficulty({ mode: 'nightmare', level: Infinity, completedIds: null })).toEqual(DEFAULT_DIFFICULTY)
    expect(normalizeDifficulty({ level: 99 }).level).toBe(8)
    expect(normalizeDifficulty({ level: -3 }).level).toBe(0)
  })

  it('raises one step per win, eases two per loss, and caps both ends', () => {
    let settings = { ...DEFAULT_DIFFICULTY, mode: 'adaptive' }
    for (let index = 0; index < 20; index++) {
      settings = difficultyAfterResult(settings, { id: `win${index}`, status: 'won', difficulty: { mode: 'adaptive' } })
      expect(settings.level).toBe(Math.min(index + 1, 8))
    }
    settings = difficultyAfterResult(settings, { id: 'loss1', status: 'lost', difficulty: { mode: 'adaptive' } })
    expect(settings.level).toBe(6)
    for (let index = 2; index < 10; index++) settings = difficultyAfterResult(settings, { id: `loss${index}`, status: 'lost', difficulty: { mode: 'adaptive' } })
    expect(settings.level).toBe(0)
  })

  it('counts each completed adaptive match once, without counting abandonments or other modes', () => {
    chooseDifficulty('adaptive')
    const encounter = configureEncounterDifficulty(generateRandomEncounter(() => 0), getDifficultySettings())
    recordDifficultyResult(encounter)
    expect(getDifficultySettings().level).toBe(0)
    recordDifficultyResult({ ...encounter, status: 'won' })
    recordDifficultyResult({ ...encounter, status: 'won' })
    expect(getDifficultySettings().level).toBe(1)
    recordDifficultyResult({ ...encounter, id: 'standard-win', status: 'won', difficulty: { mode: 'standard' } })
    expect(getDifficultySettings().level).toBe(1)
  })

  it('saves mode changes for new matches and freezes the current match and commander', () => {
    chooseDifficulty('adaptive')
    const encounter = configureEncounterDifficulty(generateRandomEncounter(() => 0), getDifficultySettings())
    const commander = encounter.enemyCommanderId
    chooseDifficulty('standard')
    recordDifficultyResult({ ...encounter, status: 'won' })
    expect(encounter.difficulty).toEqual({ mode: 'adaptive', level: 0 })
    expect(getDifficultySettings()).toMatchObject({ mode: 'standard', level: 1 })
    expect(configureEncounterDifficulty(generateRandomEncounter(() => 0), getDifficultySettings()).difficulty).toEqual({ mode: 'standard', level: 0 })
    expect(buildOpeningRadio(encounter)[1].hero.id).toBe(commander)
    expect(buildOpeningRadio({ ...encounter, pieces: encounter.pieces.slice().reverse() })[1].hero.id).toBe(commander)
  })
})

describe('authored, mission-aware commander styles', () => {
  function encounter(faction, commander, type, mode = 'commanders', level = 0) {
    return { pieces: [{ faction }], playerFaction: 'pirate', enemyCommanderId: commander, objective: { type }, difficulty: { mode, level } }
  }

  it('keeps Standard exactly at the modest baseline regardless of faction or saved level', () => {
    expect(getCommanderTactics(encounter('imperial', 'sister-mary-wren', 'destroyTarget', 'standard', 8)))
      .toEqual({ name: 'Standard', riskWeight: 0.65, pressure: 0, variety: 0.25 })
  })

  it.each(['destroyTarget', 'captureValue'])('guards ships during %s with distinct character styles', type => {
    const bold = getCommanderTactics(encounter('rebel', 'lance-rosenthorn', type))
    const measured = getCommanderTactics(encounter('rebel', 'thalia-mott', type))
    expect(measured.riskWeight).toBeGreaterThan(bold.riskWeight)
    expect(measured.pressure).toBe(0)
    expect(bold.name).toBe('Counterattacker')
  })

  it.each(['surviveTurns', 'escapeToSquare'])('both personalities hunt Pirates during %s', type => {
    const bold = getCommanderTactics(encounter('rebel', 'lance-rosenthorn', type))
    const measured = getCommanderTactics(encounter('rebel', 'thalia-mott', type))
    expect(measured.pressure).toBeGreaterThan(0)
    expect(bold.pressure).toBeGreaterThan(measured.pressure)
    expect(bold.riskWeight).toBeLessThan(getCommanderTactics(encounter('rebel', 'lance-rosenthorn', 'destroyTarget')).riskWeight)
  })

  it('steps up faction skill gently and keeps adaptive strength bounded', () => {
    const rebel = getCommanderTactics(encounter('rebel', 'lance-rosenthorn', 'surviveTurns'))
    const robo = getCommanderTactics(encounter('robocorp', 'fenris-scry', 'surviveTurns'))
    const imperial = getCommanderTactics(encounter('imperial', 'admiral-bishop-john-trace', 'surviveTurns'))
    expect(rebel.riskWeight).toBeLessThan(robo.riskWeight)
    expect(robo.riskWeight).toBeLessThan(imperial.riskWeight)
    const maximum = getCommanderTactics(encounter('imperial', 'admiral-bishop-john-trace', 'surviveTurns', 'adaptive', 8))
    expect(maximum).toEqual(getCommanderTactics(encounter('imperial', 'admiral-bishop-john-trace', 'surviveTurns', 'adaptive', 999)))
    expect(maximum.variety).toBeGreaterThan(0)
    expect(maximum.riskWeight - imperial.riskWeight).toBeLessThan(0.1)
  })
})

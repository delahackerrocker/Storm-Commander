import { useSyncExternalStore } from 'react'
import { DEFAULT_DIFFICULTY, DIFFICULTY_STORAGE_KEY, difficultyAfterResult, normalizeDifficulty } from './difficultySettings'

let fallback = JSON.stringify(DEFAULT_DIFFICULTY)
let cachedRaw
let cachedSettings = DEFAULT_DIFFICULTY
let sessionOnly = false
const listeners = new Set()

export function getDifficultySettings() {
  let raw = fallback
  try {
    if (!sessionOnly) raw = window.localStorage.getItem(DIFFICULTY_STORAGE_KEY) || JSON.stringify(DEFAULT_DIFFICULTY)
  } catch { sessionOnly = true }
  if (raw !== cachedRaw) {
    cachedRaw = raw
    try { cachedSettings = normalizeDifficulty(JSON.parse(raw)) } catch { cachedSettings = DEFAULT_DIFFICULTY }
  }
  return cachedSettings
}

function saveSettings(settings) {
  fallback = JSON.stringify(settings)
  try { window.localStorage.setItem(DIFFICULTY_STORAGE_KEY, fallback) } catch { sessionOnly = true }
  cachedRaw = undefined
  listeners.forEach(listener => listener())
}

export function chooseDifficulty(mode) {
  saveSettings(normalizeDifficulty({ ...getDifficultySettings(), mode }))
}

export function recordDifficultyResult(encounter) {
  const settings = getDifficultySettings()
  const updated = difficultyAfterResult(settings, encounter)
  if (updated !== settings) saveSettings(updated)
}

function subscribe(listener) {
  listeners.add(listener)
  const onStorage = event => {
    if (event.key === DIFFICULTY_STORAGE_KEY || event.key === null) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useDifficultySettings() {
  return useSyncExternalStore(subscribe, getDifficultySettings, () => DEFAULT_DIFFICULTY)
}

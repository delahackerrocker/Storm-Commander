import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StartPage } from '../pages/StartPage'
import { StormCommanderEncounterPage } from '../storm-commander/components/StormCommanderEncounterPage'
import { configureEncounterDifficulty } from '../storm-commander/difficulty/difficultySettings'
import { getDifficultySettings } from '../storm-commander/difficulty/useDifficultySettings'
import { generateRandomEncounter } from '../storm-commander/encounter/generateRandomEncounter'

beforeEach(() => {
  const values = new Map()
  vi.stubGlobal('localStorage', { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) })
})
afterEach(() => vi.unstubAllGlobals())

describe('difficulty controls', () => {
  it('offers three simple options, persists the choice, and never starts a game from the panel', () => {
    const onPlay = vi.fn()
    const first = render(<StartPage onPlay={onPlay} />)
    const button = screen.getByRole('button', { name: 'Difficulty' })
    button.focus()
    fireEvent.click(button)
    const dialog = screen.getByRole('dialog', { name: 'Choose your challenge' })
    expect(within(dialog).getAllByRole('radio')).toHaveLength(3)
    expect(within(dialog).getByRole('radio', { name: /Standard/ })).toBeChecked()
    fireEvent.click(within(dialog).getByRole('radio', { name: /Adaptive/ }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Done' }))
    expect(button).toHaveFocus()
    expect(onPlay).not.toHaveBeenCalled()
    first.unmount()
    render(<StartPage onPlay={onPlay} />)
    fireEvent.click(screen.getByRole('button', { name: 'Difficulty' }))
    expect(screen.getByRole('radio', { name: /Adaptive/ })).toBeChecked()
  })

  it('pauses enemy actions while open and applies new choices only to the next battle', () => {
    vi.useFakeTimers()
    try {
      const encounter = configureEncounterDifficulty(generateRandomEncounter(() => 0))
      encounter.currentFaction = encounter.factions[1]
      const setEncounter = vi.fn()
      render(<StormCommanderEncounterPage encounter={encounter} setEncounter={setEncounter}
        showInitialBriefing={false} onNewEncounter={() => {}} />)
      fireEvent.click(screen.getByRole('button', { name: 'Difficulty' }))
      expect(screen.getByText('Saved for your next match. This battle stays as it is.')).toBeInTheDocument()
      expect(screen.getAllByTestId('storm-encounter-square').every(square => square.disabled)).toBe(true)
      act(() => vi.advanceTimersByTime(6000))
      expect(setEncounter).not.toHaveBeenCalled()
      fireEvent.click(screen.getByRole('radio', { name: /Commander Styles/ }))
      expect(getDifficultySettings().mode).toBe('commanders')
      expect(encounter.difficulty.mode).toBe('standard')
      fireEvent.click(screen.getByRole('button', { name: 'Done' }))
      act(() => vi.advanceTimersByTime(3000))
      act(() => vi.advanceTimersByTime(1200))
      expect(setEncounter).toHaveBeenCalledTimes(1)
    } finally { vi.useRealTimers() }
  })
})

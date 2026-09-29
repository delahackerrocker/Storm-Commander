import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StormCommanderEncounterPage } from '../storm-commander/components/StormCommanderEncounterPage'
import { playCaptureAudio } from '../storm-commander/audio/gameAudio'

vi.mock('../storm-commander/audio/gameAudio', () => ({
  primeGameAudio: vi.fn(), playCaptureAudio: vi.fn(),
}))
const encounter = {
  id: 'combat-audio', title: 'Test raid', board: { width: 5, height: 5 },
  factions: ['pirate', 'imperial'], playerFaction: 'pirate',
  turnOrder: ['pirate', 'imperial'], currentFaction: 'pirate', status: 'active',
  objective: { type: 'destroyTarget', targetPieceId: 'enemy', text: 'Destroy the Imperial queen.' },
  pieces: [
    { id: 'player', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
    { id: 'enemy', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
  ],
}
const tick = (ms) => act(() => vi.advanceTimersByTime(ms))
afterEach(() => { vi.useRealTimers(); vi.clearAllMocks() })

describe('combat audio integration', () => {
  it.each(['pirate', 'imperial'])('plays one capture sequence for %s attacks and stops on leaving the board', (faction) => {
    vi.useFakeTimers()
    const stop = vi.fn()
    playCaptureAudio.mockReturnValue(stop)
    const { unmount } = render(<StormCommanderEncounterPage
      encounter={{ ...encounter, currentFaction: faction }} showInitialBriefing={false} setEncounter={vi.fn()} />)
    if (faction === 'pirate') {
      fireEvent.click(screen.getByRole('button', { name: /B4 Pirate rook square/ }))
      fireEvent.click(screen.getByRole('button', { name: /D4 Imperial queen capture destination/ }))
    } else {
      tick(3000)
    }
    tick(1)
    expect(playCaptureAudio).toHaveBeenCalledOnce()
    tick(400)
    expect(playCaptureAudio).toHaveBeenCalledOnce()
    unmount()
    expect(stop).toHaveBeenCalledOnce()
  })

  it('does not fire weapons or explosion sounds for ordinary movement', () => {
    vi.useFakeTimers()
    render(<StormCommanderEncounterPage encounter={encounter} showInitialBriefing={false} setEncounter={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /B4 Pirate rook square/ }))
    fireEvent.click(screen.getByRole('button', { name: /B3 .*legal destination/ }))
    tick(1200)
    expect(playCaptureAudio).not.toHaveBeenCalled()
  })
})

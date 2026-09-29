import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { StartPage } from '../pages/StartPage'
import { StormCommanderMission } from '../storm-commander/components/StormCommanderMission'
import { buildOpeningRadio, ENEMY_TAUNTS, MISSION_CALLS, RADIO_HOLD_MS, RADIO_SLIDE_MS } from '../storm-commander/comms/openingRadio'

const encounter = {
  id: 'radio-one', title: 'Random Pirate Raid', board: { width: 5, height: 5 },
  factions: ['pirate', 'imperial'], playerFaction: 'pirate',
  turnOrder: ['pirate', 'imperial'], currentFaction: 'pirate', round: 1,
  status: 'active', capturedValueByPlayer: 0,
  objective: { type: 'destroyTarget', targetPieceId: 'enemy', text: 'Destroy the Imperial queen.' },
  pieces: [
    { id: 'player', faction: 'pirate', type: 'r', square: { x: 1, y: 1 } },
    { id: 'enemy', faction: 'imperial', type: 'q', square: { x: 3, y: 1 } },
  ],
}
const tick = (duration) => act(() => vi.advanceTimersByTime(duration))
const dismiss = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Continue transmission' }))
  tick(RADIO_SLIDE_MS)
}

afterEach(() => vi.useRealTimers())

describe('title screen and opening radio', () => {
  it('cycles all four approved title images every three seconds and plays from the full-screen button', () => {
    vi.useFakeTimers()
    const onPlay = vi.fn()
    const { container, unmount } = render(<StartPage onPlay={onPlay} />)
    for (const name of ['orange-pirates', 'blue-robocorp', 'yellow-imperials', 'purple-rebels', 'orange-pirates']) {
      expect(container.querySelector('.start-title-art.is-active').src).toContain(name)
      tick(2999)
      expect(container.querySelector('.start-title-art.is-active').src).toContain(name)
      tick(1)
    }
    fireEvent.click(screen.getByRole('button', { name: 'Press to Play' }), { clientX: 2, clientY: 2 })
    expect(onPlay).not.toHaveBeenCalled()
    expect(container.querySelector('.start-page')).toHaveClass('is-launching')
    fireEvent.click(screen.getByRole('button', { name: 'Press to Play' }))
    tick(599)
    expect(onPlay).not.toHaveBeenCalled()
    tick(1)
    expect(onPlay).toHaveBeenCalledOnce()
    tick(0)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('blocks accidental taps for two seconds from Start, including the 600ms fade', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Press to Play' }))
    tick(600)
    const button = screen.getByRole('button', { name: 'Continue transmission' })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    tick(1399)
    expect(button).toBeDisabled()
    expect(screen.getByRole('dialog', { name: 'Pirate radio transmission' })).toBeInTheDocument()
    tick(1)
    expect(button).toBeEnabled()
    fireEvent.click(button)
    tick(RADIO_SLIDE_MS)
    expect(screen.getByRole('dialog', { name: 'Enemy radio transmission' })).toBeInTheDocument()
  })

  it('shows the turn owner and resets the mobile dismissal on the next turn', () => {
    vi.useFakeTimers()
    const setEncounter = vi.fn()
    const { rerender } = render(<StormCommanderMission encounter={encounter} setEncounter={setEncounter} />)
    dismiss()
    dismiss()
    const notice = screen.getByRole('status')
    expect(notice).toHaveTextContent('Your move commander!')
    expect(notice).toHaveStyle({ color: 'rgba(232, 108, 36, 0.9)' })
    fireEvent.pointerDown(screen.getByRole('region', { name: 'Random encounter board' }))
    expect(notice).toHaveClass('is-dismissed')
    rerender(<StormCommanderMission encounter={{ ...encounter, currentFaction: 'imperial' }} setEncounter={setEncounter} />)
    expect(notice).toHaveTextContent('Enemy is moving!')
    expect(notice).not.toHaveClass('is-dismissed')
    expect(notice).toHaveStyle({ color: 'rgba(213, 166, 14, 0.92)' })
  })

  it('holds each transmission for five seconds, exits in the correct direction, and then unlocks the board', () => {
    vi.useFakeTimers()
    const setEncounter = vi.fn()
    const { container } = render(<StormCommanderMission encounter={encounter} setEncounter={setEncounter} />)
    expect(screen.getByRole('dialog', { name: 'Pirate radio transmission' })).toBeInTheDocument()
    expect(container.querySelector('.storm-radio-card')).toHaveClass('is-player')
    expect(screen.getByRole('button', { name: /B4 Pirate rook square/i })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /B4 Pirate rook square/i }))
    expect(container.querySelector('.is-legal-move')).toBeNull()
    expect(container.querySelector('.storm-encounter-root')).toHaveAttribute('inert')
    tick(RADIO_HOLD_MS - 1)
    expect(container.querySelector('.storm-radio-card')).not.toHaveClass('is-leaving')
    tick(1)
    expect(container.querySelector('.storm-radio-card')).toHaveClass('is-player', 'is-leaving')
    tick(RADIO_SLIDE_MS)
    expect(screen.getByRole('dialog', { name: 'Enemy radio transmission' })).toBeInTheDocument()
    expect(container.querySelector('.storm-radio-card')).toHaveClass('is-opponent')
    tick(RADIO_HOLD_MS)
    expect(container.querySelector('.storm-radio-card')).toHaveClass('is-opponent', 'is-leaving')
    tick(RADIO_SLIDE_MS)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(container.querySelector('.storm-encounter-root')).not.toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: /B4 Pirate rook square/i })).toBeEnabled()
    expect(setEncounter).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /B4 Pirate rook square/i }))
    expect(container.querySelector('.is-legal-move')).not.toBeNull()
  })

  it('dismisses early without click-through and repeats for the next match but not a board update', () => {
    vi.useFakeTimers()
    const setEncounter = vi.fn()
    const { container, rerender, unmount } = render(<StormCommanderMission key={encounter.id} encounter={encounter} setEncounter={setEncounter} />)
    dismiss()
    dismiss()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(container.querySelector('.is-selected')).toBeNull()
    rerender(<StormCommanderMission key={encounter.id} encounter={{ ...encounter, round: 2 }} setEncounter={setEncounter} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    rerender(<StormCommanderMission key="radio-two" encounter={{ ...encounter, id: 'radio-two' }} setEncounter={setEncounter} />)
    expect(screen.getByRole('dialog', { name: 'Pirate radio transmission' })).toBeInTheDocument()
    tick(0)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('pauses the enemy AI until both calls finish and supports keyboard dismissal', () => {
    vi.useFakeTimers()
    const { container } = render(<StormCommanderMission encounter={{ ...encounter, currentFaction: 'imperial' }} setEncounter={vi.fn()} />)
    tick(4000)
    expect(container.querySelector('.storm-capture-animation-layer')).toBeNull()
    fireEvent.keyDown(screen.getByRole('button', { name: 'Continue transmission' }), { key: 'Escape' })
    tick(RADIO_SLIDE_MS)
    tick(4000)
    expect(container.querySelector('.storm-capture-animation-layer')).toBeNull()
    dismiss()
    tick(3000)
    expect(container.querySelector('.storm-capture-animation-layer')).not.toBeNull()
  })
})

describe('commander dialogue', () => {
  it('uses each mission’s concrete requirements and the correct faction portraits', () => {
    const missions = [
      [encounter.objective, /Imperial queen.*D4/],
      [{ type: 'surviveTurns', turnsRequired: 6 }, /6 turns/],
      [{ type: 'escapeToSquare', extractionSquare: { x: 4, y: 4 } }, /E1/],
      [{ type: 'captureValue', valueRequired: 7 }, /7 value/],
    ]
    for (const [objective, expected] of missions) {
      const heard = new Set()
      for (let i = 0; i < 30; i += 1) {
        const lines = buildOpeningRadio({ ...encounter, objective, id: `mission-${i}` })
        expect(lines).toHaveLength(2)
        expect(lines[0].text).toMatch(expected)
        expect(lines[0].text).not.toMatch(/[{}]/)
        expect(lines[0].hero.faction).toBe('pirate')
        expect(lines[1].hero.faction).toBe('imperial')
        expect(lines[0].hero.assets.radioPortrait).toContain('/assets/storm-commander/commanders/')
        heard.add(lines[0].text)
      }
      expect(heard.size).toBe(MISSION_CALLS[objective.type].length)
    }
    expect(new Set(ENEMY_TAUNTS).size).toBe(10)
    const taunts = new Set(Array.from({ length: 100 }, (_, i) => buildOpeningRadio({ ...encounter, id: `taunt-${i}` })[1].text))
    expect(taunts.size).toBe(10)
  })
})

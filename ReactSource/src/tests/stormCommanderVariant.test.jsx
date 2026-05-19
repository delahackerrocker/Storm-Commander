import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  STORM_COMMANDER_FACTION_IDS,
  STORM_COMMANDER_FACTION_PIECE_ASSETS,
  STORM_COMMANDER_FACTION_VISUAL_THEMES,
  STORM_COMMANDER_PIECE_ASSETS,
} from '../chess/stormCommanderPieceAssets'
import { createRandomSideFactions } from '../chess/stormCommanderFactions'
import App from '../App'

const FACTION_ASSET_PREFIX = '/assets/chess/storm-commander/factions/'

describe('Storm Commander variant', () => {
  it('opens from the main menu and renders piece images', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Storm Commander$/ }))

    const images = screen.getAllByRole('img')
    const board = document.querySelector('.storm-commander-root .chess-board')
    const whiteFaction = board.dataset.whiteFaction
    const blackFaction = board.dataset.blackFaction

    expect(screen.getByText('Storm Commander')).toBeInTheDocument()
    expect(STORM_COMMANDER_FACTION_IDS).toContain(whiteFaction)
    expect(STORM_COMMANDER_FACTION_IDS).toContain(blackFaction)
    expect(whiteFaction).not.toBe(blackFaction)
    expect(images).toHaveLength(32)
    expect(images[0]).toHaveAttribute('src', expect.stringContaining(`${FACTION_ASSET_PREFIX}${blackFaction}/`))
    expect(screen.getByAltText('White queen')).toHaveAttribute(
      'src',
      expect.stringContaining(`${FACTION_ASSET_PREFIX}${whiteFaction}/queen.png`),
    )
    expect(screen.getByAltText('White queen')).toBeInTheDocument()
  })

  it('keeps main chess in classic piece rendering mode', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^basic chess$/i }))

    expect(screen.getAllByTestId('chess-square')).toHaveLength(64)
    expect(document.querySelector('.storm-commander-effects')).not.toBeInTheDocument()
    expect(document.querySelector('.storm-commander-root')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('centralizes Storm Commander piece paths under local PNG assets', () => {
    const paths = Object.values(STORM_COMMANDER_PIECE_ASSETS)
      .flatMap((piecesByType) => Object.values(piecesByType))

    expect(paths).toHaveLength(12)

    for (const path of paths) {
      expect(path).toMatch(/^\/assets\/chess\/storm-commander\/pieces\/.+\.png$/)
    }
  })

  it('provides full faction fleets for Storm Commander', () => {
    expect(STORM_COMMANDER_FACTION_IDS).toEqual(['pirate', 'imperial', 'robocorp', 'rebel'])

    const factionPaths = STORM_COMMANDER_FACTION_IDS.flatMap((faction) =>
      Object.values(STORM_COMMANDER_FACTION_PIECE_ASSETS[faction])
    )

    expect(factionPaths).toHaveLength(24)

    for (const path of factionPaths) {
      expect(path).toMatch(/^\/assets\/chess\/storm-commander\/factions\/.+\/.+\.png$/)
    }
  })

  it('creates distinct random faction assignments for each side', () => {
    expect(createRandomSideFactions(() => 0)).toEqual({
      w: 'pirate',
      b: 'imperial',
    })
    expect(createRandomSideFactions(() => 0.99)).toEqual({
      w: 'rebel',
      b: 'robocorp',
    })
    expect(createRandomSideFactions(() => 0, { w: 'pirate', b: 'imperial' })).toEqual({
      w: 'pirate',
      b: 'robocorp',
    })
  })

  it('randomizes faction assignments when a new Storm Commander game starts', async () => {
    const user = userEvent.setup()
    const randomSpy = vi.spyOn(Math, 'random')

    randomSpy
      .mockReturnValue(0.5)
      .mockReturnValueOnce(0.01)
      .mockReturnValueOnce(0.25)
      .mockReturnValueOnce(0.99)

    try {
      render(<App />)

      await user.click(screen.getByRole('button', { name: /^Storm Commander$/ }))

      const board = document.querySelector('.storm-commander-root .chess-board')

      expect(board).toHaveAttribute('data-white-faction', 'pirate')
      expect(board).toHaveAttribute('data-black-faction', 'imperial')

      await user.click(screen.getByRole('button', { name: /^New Game$/ }))

      expect(board).toHaveAttribute('data-white-faction', 'rebel')
      expect(board).toHaveAttribute('data-black-faction', 'robocorp')
    } finally {
      randomSpy.mockRestore()
    }
  })

  it('assigns starfield drift and piece-facing variables to Storm Commander', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Storm Commander$/ }))

    const effectsRoot = document.querySelector('.storm-commander-effects')
    const root = screen.getByText('Storm Commander').closest('.storm-commander-root')

    expect(root).not.toBeNull()
    expect(effectsRoot).not.toBeNull()
    expect(effectsRoot.style.getPropertyValue('--storm-piece-rotation')).toMatch(/deg$/)
    expect(effectsRoot.style.getPropertyValue('--storm-star-drift-near-x')).toMatch(/px$/)
    expect(effectsRoot.style.getPropertyValue('--storm-star-drift-near-y')).toMatch(/px$/)
  })

  it('marks the current turn for Storm Commander visual styling without changing moves', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Storm Commander$/ }))

    const board = document.querySelector('.storm-commander-root .chess-board')
    const whiteFaction = board.dataset.whiteFaction
    const blackFaction = board.dataset.blackFaction

    expect(board).toHaveAttribute('data-side-to-move', 'w')
    expect(board.style.getPropertyValue('--storm-turn-grid-line')).toBe(
      STORM_COMMANDER_FACTION_VISUAL_THEMES[whiteFaction].gridLine,
    )
    expect(board.style.getPropertyValue('--storm-turn-hint')).toBe(
      STORM_COMMANDER_FACTION_VISUAL_THEMES[whiteFaction].hint,
    )

    await user.click(screen.getByRole('button', { name: /b1 white knight square/i }))

    expect(screen.getByRole('button', { name: /a3 empty legal destination/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /c3 empty legal destination/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /a3 empty legal destination/i }))

    expect(board).toHaveAttribute('data-side-to-move', 'b')
    expect(board.style.getPropertyValue('--storm-turn-grid-line')).toBe(
      STORM_COMMANDER_FACTION_VISUAL_THEMES[blackFaction].gridLine,
    )
    expect(board.style.getPropertyValue('--storm-turn-hint')).toBe(
      STORM_COMMANDER_FACTION_VISUAL_THEMES[blackFaction].hint,
    )
    expect(screen.getByText('Black thinking...')).toBeInTheDocument()
  })

  it('still supports move selection after the piece renderer refactor', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Storm Commander$/ }))
    await user.click(screen.getByRole('button', { name: /b1 white knight square/i }))

    expect(screen.getByRole('button', { name: /a3 empty legal destination/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /c3 empty legal destination/i })).toBeInTheDocument()
  })
})

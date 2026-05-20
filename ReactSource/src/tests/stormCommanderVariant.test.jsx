import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  STORM_COMMANDER_ASSET_VERSION,
  STORM_COMMANDER_FACTION_IDS,
  STORM_COMMANDER_FACTION_PIECE_ASSETS,
  STORM_COMMANDER_FACTION_VISUAL_THEMES,
  STORM_COMMANDER_PIECE_ASSETS,
} from '../chess/stormCommanderPieceAssets'
import { createRandomSideFactions } from '../chess/stormCommanderFactions'
import {
  STORM_COMMANDER_STARFIELD_TWEEN_MS,
  advanceStarfieldMotion,
  createInitialStarfieldMotion,
  toStarfieldLayerStyles,
  toStarfieldStyle,
} from '../chess/stormCommanderStarfield'
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

  it('renders runtime rocket exhaust for Storm Commander ships', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Storm Commander$/ }))

    const board = document.querySelector('.storm-commander-root .chess-board')

    expect(document.querySelectorAll('.storm-ship-piece')).toHaveLength(32)
    expect(document.querySelectorAll('.storm-ship-piece[data-faction]')).toHaveLength(32)
    expect(document.querySelectorAll('.storm-ship-piece .storm-rocket-exhaust')).toHaveLength(64)
    expect(
      document.querySelectorAll('.storm-ship-piece[data-piece-type="p"] .storm-rocket-exhaust'),
    ).toHaveLength(16)
    expect(
      document.querySelectorAll(
        '.storm-ship-piece[data-piece-type="p"] .storm-rocket-exhaust-center',
      ),
    ).toHaveLength(16)
    expect(
      document.querySelector(`.storm-ship-piece[data-faction="${board.dataset.whiteFaction}"]`),
    ).toBeInTheDocument()
    expect(
      document.querySelector(`.storm-ship-piece[data-faction="${board.dataset.blackFaction}"]`),
    ).toBeInTheDocument()
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
      expect(path).toMatch(/^\/assets\/chess\/storm-commander\/pieces\/.+\.png\?v=.+$/)
      expect(path).toContain(`?v=${STORM_COMMANDER_ASSET_VERSION}`)
    }
  })

  it('provides full faction fleets for Storm Commander', () => {
    expect(STORM_COMMANDER_FACTION_IDS).toEqual(['pirate', 'imperial', 'robocorp', 'rebel'])

    const factionPaths = STORM_COMMANDER_FACTION_IDS.flatMap((faction) =>
      Object.values(STORM_COMMANDER_FACTION_PIECE_ASSETS[faction])
    )

    expect(factionPaths).toHaveLength(24)

    for (const path of factionPaths) {
      expect(path).toMatch(/^\/assets\/chess\/storm-commander\/factions\/.+\/.+\.png\?v=.+$/)
      expect(path).toContain(`?v=${STORM_COMMANDER_ASSET_VERSION}`)
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
      const initialPair = `${board.dataset.whiteFaction}/${board.dataset.blackFaction}`

      await user.click(screen.getByRole('button', { name: /^New Game$/ }))

      expect(STORM_COMMANDER_FACTION_IDS).toContain(board.dataset.whiteFaction)
      expect(STORM_COMMANDER_FACTION_IDS).toContain(board.dataset.blackFaction)
      expect(board.dataset.whiteFaction).not.toBe(board.dataset.blackFaction)
      expect(`${board.dataset.whiteFaction}/${board.dataset.blackFaction}`).not.toBe(initialPair)
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
    expect(effectsRoot.style.getPropertyValue('--storm-star-tween-ms')).toBe(
      `${STORM_COMMANDER_STARFIELD_TWEEN_MS}ms`,
    )
    expect(effectsRoot.style.getPropertyValue('--storm-star-near-x')).toMatch(/px$/)
    expect(effectsRoot.style.getPropertyValue('--storm-star-mid-x')).toMatch(/px$/)
    expect(effectsRoot.style.getPropertyValue('--storm-star-far-x')).toMatch(/px$/)
    expect(effectsRoot.style.getPropertyValue('--storm-asteroid-near-x')).toMatch(/px$/)
    expect(document.querySelectorAll('.storm-starfield-layer')).toHaveLength(8)
    expect(document.querySelector('.storm-starfield-layer-streak')).not.toBeInTheDocument()
    expect(document.querySelector('.storm-starfield-layer-asteroid-near')).toBeInTheDocument()
  })

  it('advances layered starfield motion and rotates ships with the new heading', () => {
    const initialMotion = {
      ...createInitialStarfieldMotion(() => 0),
      angle: 0,
      targetAngle: 90,
      speed: 1,
      targetSpeed: 1,
      retargetInSteps: 5,
    }
    const nextMotion = advanceStarfieldMotion(initialMotion, () => 0.25, 1000)
    const layerStyles = toStarfieldLayerStyles(nextMotion)
    const nextStyle = toStarfieldStyle(nextMotion)

    expect(nextMotion.angle).toBeGreaterThan(0)
    expect(nextMotion.angle).toBeLessThan(90)
    expect(nextMotion.retargetInSteps).toBe(4)
    expect(nextMotion.speed).toBe(1)
    expect(nextMotion.nearX).toBeGreaterThan(initialMotion.nearX)
    expect(nextMotion.nearY).toBeGreaterThan(initialMotion.nearY)
    expect(nextMotion.midY).toBeGreaterThan(initialMotion.midY)
    expect(nextMotion.farY).toBeGreaterThan(initialMotion.farY)
    expect(nextMotion.asteroidNearY).toBeGreaterThan(initialMotion.asteroidNearY)
    expect(layerStyles.near.backgroundPosition).toMatch(/px .+px$/)
    expect(layerStyles.asteroidNear.backgroundPosition).toMatch(/px .+px$/)
    expect(nextStyle['--storm-star-tween-ms']).toBe(`${STORM_COMMANDER_STARFIELD_TWEEN_MS}ms`)
    expect(nextStyle['--storm-piece-rotation']).toMatch(/deg$/)
  })

  it('uses the shortest turn across the 360 degree heading wrap', () => {
    const nextMotion = advanceStarfieldMotion(
      {
        ...createInitialStarfieldMotion(() => 0),
        angle: 350,
        targetAngle: 10,
        speed: 1,
        targetSpeed: 1,
        retargetInSteps: 5,
      },
      () => 0,
      1000,
    )

    expect(nextMotion.angle).toBeGreaterThan(350)
    expect(nextMotion.angle).toBeLessThan(360)
    expect(toStarfieldStyle(nextMotion)['--storm-piece-rotation']).toBe('262.80deg')
  })

  it('unwraps new maneuver headings instead of spinning backwards through 360 degrees', () => {
    const randomValues = [10 / 360, 0.5, 0.5]
    const nextMotion = advanceStarfieldMotion(
      {
        ...createInitialStarfieldMotion(() => 0),
        angle: 350,
        targetAngle: 350,
        speed: 1,
        targetSpeed: 1,
        retargetInSteps: 1,
      },
      () => randomValues.shift() ?? 0.5,
      1000,
    )

    expect(nextMotion.targetAngle).toBeCloseTo(370)
    expect(nextMotion.angle).toBeGreaterThan(350)
    expect(nextMotion.angle).toBeLessThan(360)
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
    expect(board).toHaveAttribute('data-last-move-side', 'w')
    expect(board.style.getPropertyValue('--storm-turn-grid-line')).toBe(
      STORM_COMMANDER_FACTION_VISUAL_THEMES[blackFaction].gridLine,
    )
    expect(board.style.getPropertyValue('--storm-turn-hint')).toBe(
      STORM_COMMANDER_FACTION_VISUAL_THEMES[blackFaction].hint,
    )
    expect(board.style.getPropertyValue('--storm-last-move-ring')).toBe(
      STORM_COMMANDER_FACTION_VISUAL_THEMES[whiteFaction].hint,
    )
    expect(board.style.getPropertyValue('--storm-last-move-ring-soft')).toBe(
      STORM_COMMANDER_FACTION_VISUAL_THEMES[whiteFaction].hintSoft,
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

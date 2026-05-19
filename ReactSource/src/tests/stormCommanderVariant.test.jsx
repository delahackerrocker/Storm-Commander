import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  STORM_COMMANDER_FACTION_IDS,
  STORM_COMMANDER_FACTION_PIECE_ASSETS,
  STORM_COMMANDER_PIECE_ASSETS,
} from '../chess/stormCommanderPieceAssets'
import App from '../App'

const PIECE_ASSET_PREFIX = '/assets/chess/storm-commander/pieces/'

describe('Storm Commander variant', () => {
  it('opens from the main menu and renders piece images', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Storm Commander$/ }))

    const images = screen.getAllByRole('img')

    expect(screen.getByText('Storm Commander')).toBeInTheDocument()
    expect(images).toHaveLength(32)
    expect(images[0]).toHaveAttribute('src', expect.stringContaining(PIECE_ASSET_PREFIX))
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

  it('still supports move selection after the piece renderer refactor', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Storm Commander$/ }))
    await user.click(screen.getByRole('button', { name: /b1 white knight square/i }))

    expect(screen.getByRole('button', { name: /a3 empty legal destination/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /c3 empty legal destination/i })).toBeInTheDocument()
  })
})

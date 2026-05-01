import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { STORM_COMMANDER_PIECE_ASSETS } from '../chess/stormCommanderPieceAssets'
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

  it('still supports move selection after the piece renderer refactor', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: /^Storm Commander$/ }))
    await user.click(screen.getByRole('button', { name: /b1 white knight square/i }))

    expect(screen.getByRole('button', { name: /a3 empty legal destination/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /c3 empty legal destination/i })).toBeInTheDocument()
  })
})

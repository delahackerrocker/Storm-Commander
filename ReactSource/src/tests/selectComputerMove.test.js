import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { selectComputerMove } from '../chess/selectComputerMove'

function isLegalMove(game, selectedMove) {
  return game.moves({ verbose: true }).some((move) => {
    return (
      move.from === selectedMove.from &&
      move.to === selectedMove.to &&
      (move.promotion || null) === (selectedMove.promotion || null)
    )
  })
}

describe('selectComputerMove', () => {
  it('returns a legal black move', () => {
    const game = new Chess()
    game.move('e4')

    const move = selectComputerMove(game, () => 0)

    expect(move).toBeTruthy()
    expect(isLegalMove(game, move)).toBe(true)
  })

  it('prefers capturing a queen over a pawn', () => {
    const game = new Chess('4k3/8/8/8/3q3Q/8/3P4/4K3 b - - 0 1')

    const move = selectComputerMove(game, () => 0)

    expect(move.to).toBe('h4')
    expect(move.captured).toBe('q')
  })

  it('chooses from tied best captures without crashing', () => {
    const game = new Chess('4k3/8/8/8/3q3R/8/3R4/4K3 b - - 0 1')

    const move = selectComputerMove(game, () => 0.99)

    expect(move).toBeTruthy()
    expect(move.captured).toBe('r')
    expect(['d2', 'h4']).toContain(move.to)
    expect(isLegalMove(game, move)).toBe(true)
  })

  it('returns a quiet legal move when no captures exist', () => {
    const game = new Chess()
    game.move('e4')

    const move = selectComputerMove(game, () => 0)

    expect(move).toBeTruthy()
    expect(move.captured).toBeUndefined()
    expect(isLegalMove(game, move)).toBe(true)
  })

  it('promotes to queen when a promotion move is selected', () => {
    const game = new Chess('k7/2K5/8/1N6/8/8/7p/8 b - - 0 1')

    const move = selectComputerMove(game, () => 0)

    expect(move.from).toBe('h2')
    expect(move.to).toBe('h1')
    expect(move.promotion).toBe('q')
    expect(isLegalMove(game, move)).toBe(true)
  })
})

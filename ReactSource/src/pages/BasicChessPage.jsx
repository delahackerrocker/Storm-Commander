import { useEffect, useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { filterScenarios, getRatingRangeLabel, selectRandomScenario } from '../chess/scenarios/scenarioFilters'
import { getCuratedScenarios, loadScenarioIntoChess } from '../chess/scenarios/scenarioLoader'
import { selectComputerMove } from '../chess/selectComputerMove'
import { ChessBoard } from '../components/ChessBoard'
import { GameStatus } from '../components/GameStatus'
import { MoveHistory } from '../components/MoveHistory'
import { ScenarioPanel } from '../components/ScenarioPanel'

const COMPUTER_MOVE_DELAY_MS = 300
const SCENARIOS = getCuratedScenarios()

function cloneGame(game) {
  const clone = new Chess()
  const pgn = game.pgn()

  if (pgn) {
    clone.loadPgn(pgn)
  }

  return clone
}

function toMoveRequest(move) {
  return {
    from: move.from,
    to: move.to,
    promotion: move.promotion || 'q',
  }
}

function getStatusText(game, isBlackThinking) {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? 'Checkmate: Black wins' : 'Checkmate: White wins'
  }

  if (game.isStalemate()) {
    return 'Stalemate'
  }

  if (game.isDraw()) {
    return 'Draw'
  }

  if (isBlackThinking) {
    return 'Black thinking...'
  }

  const sideToMove = game.turn() === 'w' ? 'White' : 'Black'

  if (game.inCheck()) {
    return `${sideToMove} is in check`
  }

  return `${sideToMove} to move`
}

export function BasicChessPage({ onBack }) {
  const [game, setGame] = useState(() => new Chess())
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [legalMoves, setLegalMoves] = useState([])
  const [lastMove, setLastMove] = useState(null)
  const [isBlackThinking, setIsBlackThinking] = useState(false)
  const [currentScenario, setCurrentScenario] = useState(null)
  const [themeFilter, setThemeFilter] = useState('any')
  const [scenarioNotice, setScenarioNotice] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const statusText = useMemo(
    () => getStatusText(game, isBlackThinking),
    [game, isBlackThinking],
  )

  const moveHistory = useMemo(() => game.history(), [game])

  const filteredScenarios = useMemo(
    () => filterScenarios(SCENARIOS, { theme: themeFilter }),
    [themeFilter],
  )

  const ratingRangeLabel = useMemo(
    () => getRatingRangeLabel(filteredScenarios),
    [filteredScenarios],
  )

  useEffect(() => {
    if (!isBlackThinking || game.turn() !== 'b' || game.isGameOver()) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      const nextGame = cloneGame(game)
      const computerMove = selectComputerMove(nextGame)

      if (computerMove) {
        const madeMove = nextGame.move(toMoveRequest(computerMove))
        setLastMove(madeMove)
        setGame(nextGame)
      }

      setIsBlackThinking(false)
    }, COMPUTER_MOVE_DELAY_MS)

    return () => window.clearTimeout(timerId)
  }, [game, isBlackThinking])

  function clearSelection() {
    setSelectedSquare(null)
    setLegalMoves([])
  }

  function selectSquare(square) {
    const piece = game.get(square)

    if (!piece || piece.color !== 'w' || game.turn() !== 'w') {
      clearSelection()
      return
    }

    const moves = game
      .moves({ square, verbose: true })
      .filter((move) => !move.promotion || move.promotion === 'q')

    setSelectedSquare(square)
    setLegalMoves(moves)
  }

  function setGameFromChess(nextGame) {
    setGame(nextGame)
    setLastMove(null)
    clearSelection()
    setIsBlackThinking(!nextGame.isGameOver() && nextGame.turn() === 'b')
  }

  function loadScenario(scenario, notice = '') {
    const nextGame = loadScenarioIntoChess(scenario)

    setCurrentScenario(scenario)
    setScenarioNotice(notice || `Loaded ${scenario.id}`)
    setCopyStatus('')
    setGameFromChess(nextGame)
  }

  function loadRandomScenario(mode) {
    const scenario = selectRandomScenario(SCENARIOS, { theme: themeFilter, mode })

    if (!scenario) {
      setScenarioNotice(`No ${mode} matches the current theme filter.`)
      return
    }

    loadScenario(scenario, `Loaded random ${mode}: ${scenario.id}`)
  }

  function makeHumanMove(move) {
    const nextGame = cloneGame(game)
    const madeMove = nextGame.move(toMoveRequest(move))

    setGame(nextGame)
    setLastMove(madeMove)
    clearSelection()

    if (!nextGame.isGameOver() && nextGame.turn() === 'b') {
      setIsBlackThinking(true)
    }
  }

  function handleSquareClick(square) {
    if (isBlackThinking || game.isGameOver() || game.turn() !== 'w') {
      return
    }

    const selectedMove = legalMoves.find(
      (move) => move.to === square && (!move.promotion || move.promotion === 'q'),
    )

    if (selectedMove) {
      makeHumanMove(selectedMove)
      return
    }

    selectSquare(square)
  }

  function startNewGame() {
    setGame(new Chess())
    setSelectedSquare(null)
    setLegalMoves([])
    setLastMove(null)
    setIsBlackThinking(false)
    setCurrentScenario(null)
    setScenarioNotice('Standard starting position loaded.')
    setCopyStatus('')
  }

  function resetCurrentScenario() {
    if (currentScenario) {
      loadScenario(currentScenario, `Reset ${currentScenario.id}`)
    }
  }

  function continuePosition() {
    if (currentScenario) {
      setScenarioNotice('Position is live. Continue from the board.')
    }
  }

  async function copyFen() {
    const fen = game.fen()

    try {
      await navigator.clipboard.writeText(fen)
      setCopyStatus('FEN copied.')
    } catch {
      setCopyStatus(fen)
    }
  }

  return (
    <div className="game-page">
      <button type="button" className="back-button" onClick={onBack}>
        Back
      </button>

      <main className="app-shell">
        <section className="play-area" aria-label="Chess board">
          <ChessBoard
            game={game}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            lastMove={lastMove}
            inputDisabled={isBlackThinking || game.isGameOver()}
            onSquareClick={handleSquareClick}
          />
        </section>

        <aside className="side-panel" aria-label="Game information">
          <GameStatus
            statusText={statusText}
            lastMove={lastMove}
            isBlackThinking={isBlackThinking}
            onNewGame={startNewGame}
          />
          <div className="panel-divider" />
          <ScenarioPanel
            copyStatus={copyStatus}
            currentScenario={currentScenario}
            onContinuePosition={continuePosition}
            onCopyFen={copyFen}
            onLoadRandomPuzzle={() => loadRandomScenario('puzzle')}
            onLoadRandomScenario={() => loadRandomScenario('scenario')}
            onResetScenario={resetCurrentScenario}
            onThemeChange={setThemeFilter}
            ratingRangeLabel={ratingRangeLabel}
            scenarioNotice={scenarioNotice}
            themeFilter={themeFilter}
          />
          <div className="panel-divider" />
          <MoveHistory moves={moveHistory} />
        </aside>
      </main>
    </div>
  )
}

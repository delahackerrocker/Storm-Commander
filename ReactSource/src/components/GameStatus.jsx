export function GameStatus({ isBlackThinking, lastMove, onNewGame, statusText }) {
  return (
    <section className="game-status" aria-live="polite">
      <p className="eyebrow">Chess-ish</p>
      <h1>{statusText}</h1>
      <dl className="status-list">
        <div>
          <dt>Last move</dt>
          <dd>{lastMove?.san || 'None'}</dd>
        </div>
        <div>
          <dt>Computer</dt>
          <dd>{isBlackThinking ? 'Thinking' : 'Greedy capture'}</dd>
        </div>
      </dl>
      <button type="button" className="new-game-button" onClick={onNewGame}>
        New Game
      </button>
    </section>
  )
}

export function StartPage({ onOpenBasicChess, onOpenStormCommander }) {
  return (
    <main className="start-page" aria-label="Start menu">
      <div className="menu-stack">
        <button type="button" className="menu-button" onClick={onOpenBasicChess}>
          basic chess
        </button>
        <button type="button" className="menu-button" onClick={onOpenStormCommander}>
          Storm Commander
        </button>
      </div>
    </main>
  )
}

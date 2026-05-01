export function StartPage({ onOpenBasicChess, onOpenSecondPage }) {
  return (
    <main className="start-page" aria-label="Start menu">
      <div className="menu-stack">
        <button type="button" className="menu-button" onClick={onOpenBasicChess}>
          basic chess
        </button>
        <button type="button" className="menu-button" onClick={onOpenSecondPage}>
          second page
        </button>
      </div>
    </main>
  )
}

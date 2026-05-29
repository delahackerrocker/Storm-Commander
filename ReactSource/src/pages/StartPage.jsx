import heroImageUrl from '../assets/hero.png'

export function StartPage({
  onOpenBasicChess,
  onOpenCharacters,
  onOpenRandomEncounter,
  onOpenStormChessDrill,
}) {
  return (
    <main
      className="start-page"
      aria-label="Start menu"
      style={{ '--start-hero-image': `url(${heroImageUrl})` }}
    >
      <section className="start-menu" aria-labelledby="start-menu-title">
        <h1 id="start-menu-title">Storm Commander</h1>
        <div className="menu-stack">
          <button type="button" className="menu-button" onClick={onOpenRandomEncounter}>
            Random Encounter
          </button>
          <button type="button" className="menu-button" onClick={onOpenStormChessDrill}>
            Storm Chess Drill
          </button>
          <button type="button" className="menu-button" onClick={onOpenBasicChess}>
            Basic Chess
          </button>
          <button type="button" className="menu-button" onClick={onOpenCharacters}>
            Characters
          </button>
        </div>
      </section>
    </main>
  )
}

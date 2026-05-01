import { THEME_FILTER_OPTIONS } from '../chess/scenarios/scenarioThemes'

export function ScenarioControls({
  copyStatus,
  currentScenario,
  onContinuePosition,
  onCopyFen,
  onLoadRandomPuzzle,
  onLoadRandomScenario,
  onResetScenario,
  onThemeChange,
  ratingRangeLabel,
  themeFilter,
}) {
  return (
    <section className="scenario-controls" aria-label="Scenario controls">
      <h2>Scenario Library</h2>

      <label className="scenario-field">
        <span>Theme Filter</span>
        <select value={themeFilter} onChange={(event) => onThemeChange(event.target.value)}>
          {THEME_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <p className="rating-range">{ratingRangeLabel}</p>

      <div className="scenario-button-grid">
        <button type="button" onClick={onLoadRandomScenario}>
          New Random Scenario
        </button>
        <button type="button" onClick={onLoadRandomPuzzle}>
          New Random Puzzle
        </button>
        <button type="button" onClick={onResetScenario} disabled={!currentScenario}>
          Reset Current Scenario
        </button>
        <button type="button" onClick={onContinuePosition} disabled={!currentScenario}>
          Continue Position
        </button>
        <button type="button" onClick={onCopyFen}>
          Copy FEN
        </button>
      </div>

      {copyStatus ? <p className="scenario-note">{copyStatus}</p> : null}
    </section>
  )
}

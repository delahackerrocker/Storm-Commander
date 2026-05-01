import { formatMaterialSummary } from '../chess/scenarios/scenarioMetadata'

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'Not provided'
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'None'
  }

  return String(value)
}

export function ScenarioMetadataPanel({ scenario }) {
  if (!scenario) {
    return (
      <section className="scenario-metadata" aria-label="Scenario metadata">
        <h2>Loaded Position</h2>
        <p className="empty-history">Standard starting position</p>
      </section>
    )
  }

  return (
    <section className="scenario-metadata" aria-label="Scenario metadata">
      <h2>{scenario.id}</h2>

      <dl className="metadata-list">
        <div>
          <dt>Source</dt>
          <dd>{formatValue(scenario.source)}</dd>
        </div>
        <div>
          <dt>Source Puzzle ID</dt>
          <dd>{formatValue(scenario.sourcePuzzleId)}</dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>{formatValue(scenario.mode)}</dd>
        </div>
        <div>
          <dt>Rating</dt>
          <dd>{formatValue(scenario.rating)}</dd>
        </div>
        <div>
          <dt>Rating Deviation</dt>
          <dd>{formatValue(scenario.ratingDeviation)}</dd>
        </div>
        <div>
          <dt>Popularity</dt>
          <dd>{formatValue(scenario.popularity)}</dd>
        </div>
        <div>
          <dt>Number of Plays</dt>
          <dd>{formatValue(scenario.playCount)}</dd>
        </div>
        <div>
          <dt>Themes</dt>
          <dd>{formatValue(scenario.themes)}</dd>
        </div>
        <div>
          <dt>Opening Tags</dt>
          <dd>{formatValue(scenario.openingTags)}</dd>
        </div>
        <div>
          <dt>Side to Move</dt>
          <dd>{scenario.sideToMove === 'w' ? 'White' : 'Black'}</dd>
        </div>
        <div>
          <dt>Fullmove Number</dt>
          <dd>{formatValue(scenario.fullmoveNumber)}</dd>
        </div>
        <div>
          <dt>Piece Count</dt>
          <dd>{formatValue(scenario.pieceCount)}</dd>
        </div>
        <div className="metadata-wide">
          <dt>Material Summary</dt>
          <dd>{formatMaterialSummary(scenario.materialSummary)}</dd>
        </div>
        <div className="metadata-wide">
          <dt>Original FEN</dt>
          <dd>{scenario.originalFen}</dd>
        </div>
        <div className="metadata-wide">
          <dt>Playable FEN</dt>
          <dd>{scenario.playableFen}</dd>
        </div>
        <div className="metadata-wide">
          <dt>Game URL</dt>
          <dd>
            {scenario.gameUrl ? (
              <a href={scenario.gameUrl} target="_blank" rel="noreferrer">
                {scenario.gameUrl}
              </a>
            ) : (
              'Not provided'
            )}
          </dd>
        </div>
        <div className="metadata-wide">
          <dt>Notes</dt>
          <dd>{formatValue(scenario.notes)}</dd>
        </div>
      </dl>

      <details className="solution-details">
        <summary>Reveal Solution</summary>
        <p>Setup move: {formatValue(scenario.setupMove)}</p>
        <p>Solution moves: {formatValue(scenario.solutionMoves)}</p>
      </details>
    </section>
  )
}

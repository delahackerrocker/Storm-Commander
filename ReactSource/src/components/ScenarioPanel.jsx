import { ScenarioControls } from './ScenarioControls'
import { ScenarioMetadataPanel } from './ScenarioMetadataPanel'

export function ScenarioPanel({
  copyStatus,
  currentScenario,
  onContinuePosition,
  onCopyFen,
  onLoadRandomPuzzle,
  onLoadRandomScenario,
  onResetScenario,
  onThemeChange,
  ratingRangeLabel,
  scenarioNotice,
  themeFilter,
}) {
  return (
    <div className="scenario-panel">
      <ScenarioControls
        copyStatus={copyStatus}
        currentScenario={currentScenario}
        onContinuePosition={onContinuePosition}
        onCopyFen={onCopyFen}
        onLoadRandomPuzzle={onLoadRandomPuzzle}
        onLoadRandomScenario={onLoadRandomScenario}
        onResetScenario={onResetScenario}
        onThemeChange={onThemeChange}
        ratingRangeLabel={ratingRangeLabel}
        themeFilter={themeFilter}
      />
      {scenarioNotice ? <p className="scenario-note">{scenarioNotice}</p> : null}
      <ScenarioMetadataPanel scenario={currentScenario} />
    </div>
  )
}

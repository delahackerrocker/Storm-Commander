export const SUPPORTED_SCENARIO_THEMES = [
  'middlegame',
  'endgame',
  'fork',
  'pin',
  'skewer',
  'discoveredAttack',
  'sacrifice',
  'mate',
  'advancedPawn',
  'promotion',
  'trappedPiece',
  'deflection',
  'attraction',
  'clearance',
  'intermezzo',
  'quietMove',
  'zugzwang',
]

export const THEME_FILTER_OPTIONS = [
  { value: 'any', label: 'Any Theme' },
  ...SUPPORTED_SCENARIO_THEMES.map((theme) => ({
    value: theme,
    label: theme.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
  })),
]

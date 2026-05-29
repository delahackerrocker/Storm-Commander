export const STORM_COMMANDER_FACTION_IDS = ['pirate', 'imperial', 'robocorp', 'rebel']

export const STORM_COMMANDER_ASSET_VERSION = '20260528-hero-profiles'

export const STORM_COMMANDER_ASSET_BASE_URL = import.meta.env.BASE_URL || '/'

const versionStormCommanderAsset = (path) =>
  `${STORM_COMMANDER_ASSET_BASE_URL}${path.replace(/^\/+/, '')}?v=${STORM_COMMANDER_ASSET_VERSION}`

export const STORM_COMMANDER_FACTION_VISUAL_THEMES = {
  pirate: {
    gridLine: 'rgba(232, 108, 36, 0.1725)',
    hint: 'rgba(232, 108, 36, 0.9)',
    hintSoft: 'rgba(232, 108, 36, 0.24)',
  },
  imperial: {
    gridLine: 'rgba(213, 166, 14, 0.1875)',
    hint: 'rgba(213, 166, 14, 0.92)',
    hintSoft: 'rgba(213, 166, 14, 0.26)',
  },
  robocorp: {
    gridLine: 'rgba(85, 170, 242, 0.1725)',
    hint: 'rgba(85, 170, 242, 0.9)',
    hintSoft: 'rgba(85, 170, 242, 0.24)',
  },
  rebel: {
    gridLine: 'rgba(154, 112, 212, 0.1875)',
    hint: 'rgba(154, 112, 212, 0.92)',
    hintSoft: 'rgba(154, 112, 212, 0.26)',
  },
}

export const STORM_COMMANDER_FACTION_PIECE_ASSETS = {
  pirate: {
    k: versionStormCommanderAsset('/assets/chess/storm-commander/factions/pirate/king.png'),
    q: versionStormCommanderAsset('/assets/chess/storm-commander/factions/pirate/queen.png'),
    r: versionStormCommanderAsset('/assets/chess/storm-commander/factions/pirate/rook.png'),
    b: versionStormCommanderAsset('/assets/chess/storm-commander/factions/pirate/bishop.png'),
    n: versionStormCommanderAsset('/assets/chess/storm-commander/factions/pirate/knight.png'),
    p: versionStormCommanderAsset('/assets/chess/storm-commander/factions/pirate/pawn.png'),
  },
  imperial: {
    k: versionStormCommanderAsset('/assets/chess/storm-commander/factions/imperial/king.png'),
    q: versionStormCommanderAsset('/assets/chess/storm-commander/factions/imperial/queen.png'),
    r: versionStormCommanderAsset('/assets/chess/storm-commander/factions/imperial/rook.png'),
    b: versionStormCommanderAsset('/assets/chess/storm-commander/factions/imperial/bishop.png'),
    n: versionStormCommanderAsset('/assets/chess/storm-commander/factions/imperial/knight.png'),
    p: versionStormCommanderAsset('/assets/chess/storm-commander/factions/imperial/pawn.png'),
  },
  robocorp: {
    k: versionStormCommanderAsset('/assets/chess/storm-commander/factions/robocorp/king.png'),
    q: versionStormCommanderAsset('/assets/chess/storm-commander/factions/robocorp/queen.png'),
    r: versionStormCommanderAsset('/assets/chess/storm-commander/factions/robocorp/rook.png'),
    b: versionStormCommanderAsset('/assets/chess/storm-commander/factions/robocorp/bishop.png'),
    n: versionStormCommanderAsset('/assets/chess/storm-commander/factions/robocorp/knight.png'),
    p: versionStormCommanderAsset('/assets/chess/storm-commander/factions/robocorp/pawn.png'),
  },
  rebel: {
    k: versionStormCommanderAsset('/assets/chess/storm-commander/factions/rebel/king.png'),
    q: versionStormCommanderAsset('/assets/chess/storm-commander/factions/rebel/queen.png'),
    r: versionStormCommanderAsset('/assets/chess/storm-commander/factions/rebel/rook.png'),
    b: versionStormCommanderAsset('/assets/chess/storm-commander/factions/rebel/bishop.png'),
    n: versionStormCommanderAsset('/assets/chess/storm-commander/factions/rebel/knight.png'),
    p: versionStormCommanderAsset('/assets/chess/storm-commander/factions/rebel/pawn.png'),
  },
}

export const STORM_COMMANDER_PIECE_ASSETS = {
  w: {
    k: versionStormCommanderAsset('/assets/chess/storm-commander/pieces/white-king.png'),
    q: versionStormCommanderAsset('/assets/chess/storm-commander/pieces/white-queen.png'),
    r: versionStormCommanderAsset('/assets/chess/storm-commander/pieces/white-rook.png'),
    b: versionStormCommanderAsset('/assets/chess/storm-commander/pieces/white-bishop.png'),
    n: versionStormCommanderAsset('/assets/chess/storm-commander/pieces/white-knight.png'),
    p: versionStormCommanderAsset('/assets/chess/storm-commander/pieces/white-pawn.png'),
  },
  b: {
    k: versionStormCommanderAsset('/assets/chess/storm-commander/pieces/black-king.png'),
    q: versionStormCommanderAsset('/assets/chess/storm-commander/pieces/black-queen.png'),
    r: versionStormCommanderAsset('/assets/chess/storm-commander/pieces/black-rook.png'),
    b: versionStormCommanderAsset('/assets/chess/storm-commander/pieces/black-bishop.png'),
    n: versionStormCommanderAsset('/assets/chess/storm-commander/pieces/black-knight.png'),
    p: versionStormCommanderAsset('/assets/chess/storm-commander/pieces/black-pawn.png'),
  },
}

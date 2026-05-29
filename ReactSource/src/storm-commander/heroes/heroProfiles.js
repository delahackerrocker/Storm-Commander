import {
  STORM_COMMANDER_ASSET_BASE_URL,
  STORM_COMMANDER_ASSET_VERSION,
} from '../../chess/stormCommanderPieceAssets'

const HERO_ASSET_ROOT = '/assets/chess/storm-commander/heroes'

const STORM_COMMANDER_HERO_COLORS_BY_FACTION = {
  pirate: '#e86c24',
  imperial: '#d5a60e',
  robocorp: '#55aaf2',
  rebel: '#9a70d4',
}

const versionHeroAsset = (path) =>
  `${STORM_COMMANDER_ASSET_BASE_URL}${path.replace(/^\/+/, '')}?v=${STORM_COMMANDER_ASSET_VERSION}`

const heroAsset = (faction, heroId, fileName) =>
  versionHeroAsset(`${HERO_ASSET_ROOT}/${faction}/${heroId}/${fileName}`)

function createHeroProfile({ id, fullName, faction, page }) {
  return {
    id,
    fullName,
    faction,
    color: STORM_COMMANDER_HERO_COLORS_BY_FACTION[faction],
    source: {
      document: 'Inspo/RebelFutureDesignDeck.pdf',
      page,
    },
    assets: {
      portraits: [
        heroAsset(faction, id, 'portrait-a.png'),
        heroAsset(faction, id, 'portrait-b.png'),
      ],
      fullBodies: [
        heroAsset(faction, id, 'full-body-a.png'),
        heroAsset(faction, id, 'full-body-b.png'),
      ],
    },
  }
}

export const STORM_COMMANDER_HERO_PROFILES = [
  createHeroProfile({
    id: 'prank-sumatra',
    fullName: 'Prank Sumatra',
    faction: 'pirate',
    page: 30,
  }),
  createHeroProfile({
    id: 'captain-lilith-haraway',
    fullName: 'Captain Lilith Haraway',
    faction: 'pirate',
    page: 31,
  }),
  createHeroProfile({
    id: 'admiral-bishop-john-trace',
    fullName: 'Admiral/Bishop John Trace',
    faction: 'imperial',
    page: 32,
  }),
  createHeroProfile({
    id: 'sister-mary-wren',
    fullName: 'Sister Mary Wren',
    faction: 'imperial',
    page: 33,
  }),
  createHeroProfile({
    id: 'dayna-scry',
    fullName: 'Dayna Scry',
    faction: 'robocorp',
    page: 34,
  }),
  createHeroProfile({
    id: 'fenris-scry',
    fullName: 'Fenris Scry',
    faction: 'robocorp',
    page: 35,
  }),
  createHeroProfile({
    id: 'lance-rosenthorn',
    fullName: 'Lance Rosenthorn',
    faction: 'rebel',
    page: 36,
  }),
  createHeroProfile({
    id: 'thalia-mott',
    fullName: 'Thalia Mott',
    faction: 'rebel',
    page: 37,
  }),
]

export const STORM_COMMANDER_HEROES_BY_FACTION = STORM_COMMANDER_HERO_PROFILES.reduce(
  (heroesByFaction, hero) => ({
    ...heroesByFaction,
    [hero.faction]: [...(heroesByFaction[hero.faction] || []), hero],
  }),
  {},
)

const HERO_INDEX_BY_PIECE_TYPE = {
  k: 0,
  q: 0,
  r: 0,
  b: 1,
  n: 1,
  p: 1,
}

export function getStormCommanderHeroesForFaction(faction) {
  return STORM_COMMANDER_HEROES_BY_FACTION[faction] || []
}

export function getStormCommanderHeroForPiece(piece) {
  const factionHeroes = getStormCommanderHeroesForFaction(piece?.faction)

  if (factionHeroes.length === 0) {
    return null
  }

  const heroIndex = HERO_INDEX_BY_PIECE_TYPE[piece?.type] ?? 0

  return factionHeroes[heroIndex % factionHeroes.length]
}

import { STORM_COMMANDER_FACTION_IDS } from './stormCommanderPieceAssets'

function getRandomIndex(length, random) {
  return Math.min(Math.floor(random() * length), length - 1)
}

const STORM_COMMANDER_FACTION_MATCHUPS = STORM_COMMANDER_FACTION_IDS.flatMap((whiteFaction) =>
  STORM_COMMANDER_FACTION_IDS
    .filter((blackFaction) => blackFaction !== whiteFaction)
    .map((blackFaction) => ({
      w: whiteFaction,
      b: blackFaction,
    })),
)

function isSameSideFactionPair(left, right) {
  return left?.w === right?.w && left?.b === right?.b
}

export function createRandomSideFactions(random = Math.random, previousSideFactions) {
  const matchups = previousSideFactions
    ? STORM_COMMANDER_FACTION_MATCHUPS.filter(
        (matchup) => !isSameSideFactionPair(matchup, previousSideFactions),
      )
    : STORM_COMMANDER_FACTION_MATCHUPS
  const matchup = matchups[getRandomIndex(matchups.length, random)]

  return { ...matchup }
}

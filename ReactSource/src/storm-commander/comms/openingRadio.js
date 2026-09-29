import { getStormCommanderHeroForPiece, STORM_COMMANDER_HERO_PROFILES } from '../heroes/heroProfiles'
import { getEncounterPieceLabel } from '../tactics/encounterConstants'

export const RADIO_HOLD_MS = 5000
export const RADIO_SLIDE_MS = 320

export const MISSION_CALLS = {
  destroyTarget: [
    'See that {target} at {targetSquare}? Punch through and take it out. One good hit and we can call this a very profitable misunderstanding.',
    'All right, hotshot. The {target} at {targetSquare} is our mark. Blast it out of the sky. Try to leave something worth stealing!',
    'There! The {target}, at {targetSquare}. Take that ship down and the job is done. Guns hot, crew. Let’s make an entrance!',
  ],
  surviveTurns: [
    'Jump drive’s coughing sparks. Keep at least one of our ships flying for {turns} turns while I sweet-talk the engine. Nobody gets left in the vacuum!',
    'We need {turns} turns to charge the jump drive. Keep a ship alive until then, hotshot. You dodge the lasers; I’ll handle the screaming!',
    'Bad news: we’re surrounded. Good news: we only need to survive {turns} turns. Keep one of our ships in one piece and we’re out of here!',
  ],
  escapeToSquare: [
    'There’s our way out: {extraction}. Get any one of our ships to that beacon. Full burn, crew. We can argue about the paintwork later!',
    'The blockade has a hole at {extraction}. Slip any of our ships through and we’re clear. Fly it like you stole it. Because we did!',
    'Extraction beacon’s lit at {extraction}. Get one Pirate ship there. Just one! Keep your eyes on the exit and your finger on the trigger!',
  ],
  captureValue: [
    'Their fleet’s our payday. Capture {value} value worth of enemy ships and we’re done here. Pick the juicy targets, hotshot!',
    'Time to shake down this blockade. We need {value} value in captured ships. Bring me a haul big enough to make their admiral cry!',
    'Cargo holds are empty and I hate that. Take enemy ships worth {value} value to finish the raid. Let’s go shopping with the guns on!',
  ],
}

export const ENEMY_TAUNTS = [
  'Pirate scum! I’ll have your engines mounted over my command chair before this is over!',
  'You call that a fleet? I’ve scraped more dangerous things off my landing gear!',
  'Run while you can, pirates. Every exit leads straight into my guns!',
  'You’ll never succeed. I’ve already picked out the cell with your name on it!',
  'That stolen bucket won’t save you. Prepare to become a very brief flash of light!',
  'Your luck ends here, pirate. And I intend to enjoy every glorious second!',
  'You should have stayed in whatever junkyard spat you out. This sector belongs to me!',
  'I know every trick in your filthy little handbook. Go on. Surprise me!',
  'When I’m finished, the only thing left of your legend will be a distress signal!',
  'Enjoy your last clever remark, pirate. My guns always get the final word!',
]

function indexFor(seed, length) {
  let hash = 0
  for (const character of String(seed)) hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0
  return hash % length
}

export function getInitialCommsPiece(pieces, encounterId) {
  if (!pieces.length) return null
  const seed = [...String(encounterId)].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return pieces[seed % pieces.length]
}

function squareLabel(square, board) {
  return square ? `${String.fromCharCode(65 + square.x)}${board.height - square.y}` : 'the marked sector'
}

export function buildOpeningRadio(encounter) {
  const objective = encounter.objective
  const player = getInitialCommsPiece(
    encounter.pieces.filter((piece) => piece.faction === encounter.playerFaction), encounter.id,
  )
  const opponent = encounter.pieces.find((piece) => piece.id === objective.targetPieceId)
    || getInitialCommsPiece(encounter.pieces.filter((piece) => piece.faction !== encounter.playerFaction), encounter.id)
  const target = encounter.pieces.find((piece) => piece.id === objective.targetPieceId)
  const context = {
    target: getEncounterPieceLabel(target),
    targetSquare: squareLabel(target?.square, encounter.board),
    turns: objective.turnsRequired,
    extraction: squareLabel(objective.extractionSquare, encounter.board),
    value: objective.valueRequired,
  }
  const calls = MISSION_CALLS[objective.type] || [objective.text]
  const text = calls[indexFor(`${encounter.id}:mission`, calls.length)]
    .replace(/\{(\w+)\}/g, (_, key) => context[key])
  return [
    { side: 'player', hero: getStormCommanderHeroForPiece(player), text },
    { side: 'opponent', hero: STORM_COMMANDER_HERO_PROFILES.find(hero => hero.id === encounter.enemyCommanderId) || getStormCommanderHeroForPiece(opponent),
      text: ENEMY_TAUNTS[indexFor(`${encounter.id}:enemy`, ENEMY_TAUNTS.length)] },
  ]
}

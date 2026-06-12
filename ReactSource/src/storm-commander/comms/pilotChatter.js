import {
  getEncounterPieceLabel,
  getFactionDisplayName,
} from '../tactics/encounterConstants'

export const STORM_COMMANDER_BRIEFING_LINE_DURATION_MS = 1800

export const STORM_COMMANDER_BRIEFING_CHATTER_VARIATIONS = {
  destroyTarget: [
    [
      {
        side: 'player',
        role: 'playerLead',
        text: 'Target lock is clean. Objective says: {objective}',
      },
      {
        side: 'opponent',
        role: 'target',
        text: 'You picked the loudest hull in the formation. Try to keep up.',
      },
      {
        side: 'player',
        role: 'playerLead',
        text: 'Ignore the screen. Drop the {target} and this raid breaks open.',
      },
      {
        side: 'opponent',
        role: 'target',
        text: 'Then come claim me, pirates.',
      },
    ],
    [
      {
        side: 'player',
        role: 'playerLead',
        text: 'Strike wing, mark the {target}. That is the mission.',
      },
      {
        side: 'opponent',
        role: 'target',
        text: '{EnemyFaction} command hears you breathing on the channel.',
      },
      {
        side: 'player',
        role: 'playerScout',
        text: '{objective} Keep your shots disciplined.',
      },
      {
        side: 'opponent',
        role: 'target',
        text: 'Disciplined fire still has to cross my guns.',
      },
    ],
    [
      {
        side: 'player',
        role: 'playerLead',
        text: 'All ships, burn lanes toward the {target}.',
      },
      {
        side: 'opponent',
        role: 'target',
        text: 'The raiders finally found a brave target.',
      },
      {
        side: 'player',
        role: 'playerHeavy',
        text: 'Confirmed objective: {objective}',
      },
      {
        side: 'opponent',
        role: 'target',
        text: 'I will be here when your courage runs out.',
      },
    ],
  ],
  surviveTurns: [
    [
      {
        side: 'player',
        role: 'playerLead',
        text: 'Jump drive is cold. Objective is simple: survive {turnsRequired} turns.',
      },
      {
        side: 'opponent',
        role: 'opponentLead',
        text: 'Your engines sound tired already.',
      },
      {
        side: 'player',
        role: 'playerScout',
        text: '{objective} We only need time.',
      },
      {
        side: 'opponent',
        role: 'opponentLead',
        text: 'Time is the one thing we will not sell you.',
      },
    ],
    [
      {
        side: 'player',
        role: 'playerScout',
        text: 'Charge clock reads {turnsRequired} turns. Keep breathing until then.',
      },
      {
        side: 'opponent',
        role: 'opponentLead',
        text: '{EnemyFaction} guns are already ranging your exit vector.',
      },
      {
        side: 'player',
        role: 'playerLead',
        text: 'Hold formation. Objective: {objective}',
      },
      {
        side: 'opponent',
        role: 'opponentScout',
        text: 'Formation noted. Firing solution improving.',
      },
    ],
    [
      {
        side: 'player',
        role: 'playerLead',
        text: 'Nobody wins hero medals here. We survive {turnsRequired} turns.',
      },
      {
        side: 'opponent',
        role: 'opponentScout',
        text: 'Running is still a plan, I suppose.',
      },
      {
        side: 'player',
        role: 'playerHeavy',
        text: '{objective} Screen the bridge and stall them.',
      },
      {
        side: 'opponent',
        role: 'opponentLead',
        text: 'Stall too long and the board belongs to us.',
      },
    ],
  ],
  escapeToSquare: [
    [
      {
        side: 'player',
        role: 'playerScout',
        text: 'Extraction flare is live at {extractionSquare}.',
      },
      {
        side: 'opponent',
        role: 'opponentLead',
        text: 'We see the beacon. We also see the cowards crawling toward it.',
      },
      {
        side: 'player',
        role: 'playerLead',
        text: 'Objective: {objective} Any {playerFaction} hull can make the run.',
      },
      {
        side: 'opponent',
        role: 'opponentScout',
        text: 'Then we only have to stop one of you.',
      },
    ],
    [
      {
        side: 'player',
        role: 'playerLead',
        text: 'Route plotted. Push a ship to {extractionSquare}.',
      },
      {
        side: 'opponent',
        role: 'opponentScout',
        text: 'A straight line to safety rarely stays straight.',
      },
      {
        side: 'player',
        role: 'playerScout',
        text: '{objective} Do not overfight this one.',
      },
      {
        side: 'opponent',
        role: 'opponentLead',
        text: 'Overfight, underfight, it ends in our net.',
      },
    ],
    [
      {
        side: 'player',
        role: 'playerHeavy',
        text: 'Escort protocol active. Extraction square is {extractionSquare}.',
      },
      {
        side: 'opponent',
        role: 'opponentLead',
        text: '{EnemyFaction} blockade tightening.',
      },
      {
        side: 'player',
        role: 'playerLead',
        text: 'Restating objective: {objective}',
      },
      {
        side: 'opponent',
        role: 'opponentScout',
        text: 'Restating threat: we are closer than you think.',
      },
    ],
  ],
  captureValue: [
    [
      {
        side: 'player',
        role: 'playerLead',
        text: 'Break their formation by taking {valueRequired} value in prizes.',
      },
      {
        side: 'opponent',
        role: 'opponentLead',
        text: 'Counting our ships before you catch them is rude.',
      },
      {
        side: 'player',
        role: 'playerHeavy',
        text: 'Objective: {objective} Current haul is {currentValue} value.',
      },
      {
        side: 'opponent',
        role: 'opponentScout',
        text: 'Come close enough to collect.',
      },
    ],
    [
      {
        side: 'player',
        role: 'playerScout',
        text: 'Prize ledger open. We need {valueRequired} value captured.',
      },
      {
        side: 'opponent',
        role: 'opponentLead',
        text: '{EnemyFaction} hulls are not cargo tags.',
      },
      {
        side: 'player',
        role: 'playerLead',
        text: '{objective} Pick targets that pay.',
      },
      {
        side: 'opponent',
        role: 'opponentScout',
        text: 'Every target you chase pulls you deeper.',
      },
    ],
    [
      {
        side: 'player',
        role: 'playerHeavy',
        text: 'Open fire on valuable hulls. Quota is {valueRequired} value.',
      },
      {
        side: 'opponent',
        role: 'opponentScout',
        text: 'Pirates and arithmetic. That is new.',
      },
      {
        side: 'player',
        role: 'playerLead',
        text: 'Restating objective: {objective}',
      },
      {
        side: 'opponent',
        role: 'opponentLead',
        text: 'Restating answer: denied.',
      },
    ],
  ],
}

const PLAYER_LEAD_TYPES = ['q', 'k', 'r', 'n', 'b', 'p']
const PLAYER_SCOUT_TYPES = ['p', 'n', 'b', 'r', 'q', 'k']
const PLAYER_HEAVY_TYPES = ['r', 'q', 'k', 'b', 'n', 'p']
const OPPONENT_LEAD_TYPES = ['q', 'k', 'r', 'n', 'b', 'p']
const OPPONENT_SCOUT_TYPES = ['p', 'n', 'b', 'r', 'q', 'k']

function hashString(value) {
  return String(value)
    .split('')
    .reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0)
}

function stableIndex(seed, length) {
  if (!length) {
    return 0
  }

  return Math.abs(hashString(seed)) % length
}

function getSquareLabel(square, board) {
  if (!square || !board) {
    return 'unknown square'
  }

  return `${String.fromCharCode(65 + square.x)}${board.height - square.y}`
}

function getOpponentPieces(encounter) {
  return (encounter?.pieces || []).filter(
    (piece) => piece.faction !== encounter.playerFaction,
  )
}

function getPlayerPieces(encounter) {
  return (encounter?.pieces || []).filter(
    (piece) => piece.faction === encounter.playerFaction,
  )
}

function choosePreferredPiece(pieces, preferredTypes) {
  for (const type of preferredTypes) {
    const piece = pieces.find((candidate) => candidate.type === type)

    if (piece) {
      return piece
    }
  }

  return pieces[0] || null
}

function chooseSpeakerPiece(encounter, line) {
  const playerPieces = getPlayerPieces(encounter)
  const opponentPieces = getOpponentPieces(encounter)

  if (line.role === 'target') {
    return (
      opponentPieces.find((piece) => piece.id === encounter?.objective?.targetPieceId) ||
      choosePreferredPiece(opponentPieces, OPPONENT_LEAD_TYPES)
    )
  }

  if (line.role === 'playerScout') {
    return choosePreferredPiece(playerPieces, PLAYER_SCOUT_TYPES)
  }

  if (line.role === 'playerHeavy') {
    return choosePreferredPiece(playerPieces, PLAYER_HEAVY_TYPES)
  }

  if (line.role === 'opponentScout') {
    return choosePreferredPiece(opponentPieces, OPPONENT_SCOUT_TYPES)
  }

  if (line.role === 'opponentLead') {
    return choosePreferredPiece(opponentPieces, OPPONENT_LEAD_TYPES)
  }

  if (line.side === 'opponent') {
    return choosePreferredPiece(opponentPieces, OPPONENT_LEAD_TYPES)
  }

  return choosePreferredPiece(playerPieces, PLAYER_LEAD_TYPES)
}

function buildChatterContext(encounter) {
  const objective = encounter?.objective || {}
  const targetPiece = (encounter?.pieces || []).find(
    (piece) => piece.id === objective.targetPieceId,
  )
  const opponentFaction =
    getOpponentPieces(encounter)[0]?.faction ||
    encounter?.factions?.find((faction) => faction !== encounter.playerFaction)

  return {
    currentValue: String(encounter?.capturedValueByPlayer || 0),
    enemyFaction: getFactionDisplayName(opponentFaction),
    EnemyFaction: getFactionDisplayName(opponentFaction),
    extractionSquare: getSquareLabel(objective.extractionSquare, encounter?.board),
    objective: objective.text || 'No objective loaded.',
    playerFaction: getFactionDisplayName(encounter?.playerFaction),
    target: getEncounterPieceLabel(targetPiece),
    turnsRequired: String(objective.turnsRequired || 0),
    valueRequired: String(objective.valueRequired || 0),
  }
}

function formatChatterText(template, context) {
  return template.replace(/\{([A-Za-z]+)\}/g, (match, key) => context[key] ?? match)
}

export function buildPilotChatterSequence(encounter) {
  const objectiveType = encounter?.objective?.type
  const variations = STORM_COMMANDER_BRIEFING_CHATTER_VARIATIONS[objectiveType]

  if (!variations?.length) {
    return []
  }

  const variationIndex = stableIndex(`${encounter?.id || 'encounter'}:${objectiveType}`, variations.length)
  const context = buildChatterContext(encounter)

  return variations[variationIndex]
    .map((line, index) => {
      const speakerPiece = chooseSpeakerPiece(encounter, line)

      if (!speakerPiece) {
        return null
      }

      return {
        faction: speakerPiece.faction,
        id: `${encounter?.id || 'encounter'}-${objectiveType}-${variationIndex}-${index}`,
        objectiveType,
        pieceId: speakerPiece.id,
        side: line.side,
        text: formatChatterText(line.text, context),
      }
    })
    .filter(Boolean)
}

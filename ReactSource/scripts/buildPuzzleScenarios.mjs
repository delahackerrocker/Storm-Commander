import { createReadStream, createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline'
import { Chess } from 'chess.js'
import { SUPPORTED_SCENARIO_THEMES } from '../src/chess/scenarios/scenarioThemes.js'
import {
  computeMaterialSummaryFromFen,
  computePieceCountFromFen,
  getFullmoveNumberFromFen,
  getSideToMoveFromFen,
} from '../src/chess/scenarios/scenarioMetadata.js'

const DEFAULT_OPTIONS = {
  input: null,
  output: 'src/chess/scenarios/curatedScenarios.json',
  limit: 500,
  minRating: 800,
  maxRating: 1800,
  minPopularity: 70,
  minFullmove: 15,
  maxPieceCount: 28,
  themes: [
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
  ],
}

function parseNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseCsvLine(line) {
  const cells = []
  let cell = ''
  let isQuoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const nextChar = line[index + 1]

    if (char === '"' && isQuoted && nextChar === '"') {
      cell += '"'
      index += 1
      continue
    }

    if (char === '"') {
      isQuoted = !isQuoted
      continue
    }

    if (char === ',' && !isQuoted) {
      cells.push(cell)
      cell = ''
      continue
    }

    cell += char
  }

  cells.push(cell)
  return cells
}

export function rowFromCsvLine(headers, line) {
  const cells = parseCsvLine(line)
  const row = {}

  headers.forEach((header, index) => {
    row[header] = cells[index] ?? ''
  })

  return row
}

export function parseArgs(argv) {
  const options = { ...DEFAULT_OPTIONS }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--help') {
      options.help = true
      continue
    }

    if (!arg.startsWith('--')) {
      continue
    }

    const key = arg.slice(2)
    const value = argv[index + 1]
    index += 1

    if (key === 'themes') {
      options.themes = value.split(',').map((theme) => theme.trim()).filter(Boolean)
    } else if (key in options && typeof options[key] === 'number') {
      options[key] = Number(value)
    } else {
      options[key] = value
    }
  }

  return options
}

export function applyUciMove(game, uciMove) {
  if (!uciMove || uciMove.length < 4) {
    return null
  }

  return game.move({
    from: uciMove.slice(0, 2),
    to: uciMove.slice(2, 4),
    promotion: uciMove[4] || 'q',
  })
}

export function normalizeLichessRow(row) {
  const moves = row.Moves.split(/\s+/).filter(Boolean)
  const originalFen = row.FEN
  const game = new Chess(originalFen)
  const setupMove = moves[0] || null

  if (setupMove) {
    const appliedMove = applyUciMove(game, setupMove)

    if (!appliedMove) {
      return null
    }
  }

  const playableFen = game.fen()
  const themes = row.Themes.split(/\s+/).filter(Boolean)
  const openingTags = row.OpeningTags.split(/\s+/).filter(Boolean)

  return {
    id: `lichess_${row.PuzzleId}`,
    source: 'lichess',
    sourcePuzzleId: row.PuzzleId,
    originalFen,
    playableFen,
    setupMove,
    solutionMoves: moves.slice(1),
    rating: parseNumber(row.Rating),
    ratingDeviation: parseNumber(row.RatingDeviation),
    popularity: parseNumber(row.Popularity),
    playCount: parseNumber(row.NbPlays),
    themes,
    openingTags,
    mode: 'puzzle',
    sideToMove: getSideToMoveFromFen(playableFen),
    fullmoveNumber: getFullmoveNumberFromFen(playableFen),
    pieceCount: computePieceCountFromFen(playableFen),
    materialSummary: computeMaterialSummaryFromFen(playableFen),
    gameUrl: row.GameUrl || null,
    notes: '',
  }
}

export function scenarioMatchesOptions(scenario, options) {
  if (!scenario) {
    return false
  }

  if (scenario.rating !== null && scenario.rating < options.minRating) {
    return false
  }

  if (scenario.rating !== null && scenario.rating > options.maxRating) {
    return false
  }

  if (scenario.popularity !== null && scenario.popularity < options.minPopularity) {
    return false
  }

  if (scenario.fullmoveNumber < options.minFullmove) {
    return false
  }

  if (scenario.pieceCount > options.maxPieceCount) {
    return false
  }

  return scenario.themes.some((theme) => options.themes.includes(theme))
}

export async function buildPuzzleScenarios(options) {
  if (!options.input) {
    throw new Error('Missing required --input path')
  }

  const scenarios = []
  const inputPath = resolve(options.input)
  const stream = createReadStream(inputPath, { encoding: 'utf8' })
  const reader = readline.createInterface({ input: stream, crlfDelay: Infinity })
  let headers = null

  for await (const line of reader) {
    if (!headers) {
      headers = parseCsvLine(line)
      continue
    }

    if (!line.trim()) {
      continue
    }

    try {
      const row = rowFromCsvLine(headers, line)
      const scenario = normalizeLichessRow(row)

      if (scenarioMatchesOptions(scenario, options)) {
        scenarios.push(scenario)
      }
    } catch {
      // Bad puzzle rows are expected in local curation passes. Skip them.
    }

    if (scenarios.length >= options.limit) {
      break
    }
  }

  const outputPath = resolve(options.output)
  await mkdir(dirname(outputPath), { recursive: true })

  await new Promise((resolveWrite, rejectWrite) => {
    const writer = createWriteStream(outputPath, { encoding: 'utf8' })
    writer.on('error', rejectWrite)
    writer.on('finish', resolveWrite)
    writer.end(`${JSON.stringify(scenarios, null, 2)}\n`)
  })

  return scenarios
}

function printHelp() {
  console.log(`Usage:
node scripts/buildPuzzleScenarios.mjs --input data/lichess_db_puzzle.csv --output src/chess/scenarios/curatedScenarios.json

Options:
  --limit 500
  --minRating 800
  --maxRating 1800
  --minPopularity 70
  --minFullmove 15
  --maxPieceCount 28
  --themes ${SUPPORTED_SCENARIO_THEMES.join(',')}
`)
}

const isCli = process.argv[1] === fileURLToPath(import.meta.url)

if (isCli) {
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    printHelp()
  } else {
    buildPuzzleScenarios(options)
      .then((scenarios) => {
        console.log(`Wrote ${scenarios.length} scenarios to ${options.output}`)
      })
      .catch((error) => {
        console.error(error.message)
        process.exitCode = 1
      })
  }
}

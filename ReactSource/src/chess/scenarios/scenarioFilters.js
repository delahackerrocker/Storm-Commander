export function filterScenarios(
  scenarios,
  { theme = 'any', mode = 'any', minRating = null, maxRating = null } = {},
) {
  return scenarios.filter((scenario) => {
    if (theme !== 'any' && !scenario.themes.includes(theme)) {
      return false
    }

    if (mode !== 'any' && scenario.mode !== mode) {
      return false
    }

    if (minRating !== null && scenario.rating !== null && scenario.rating < minRating) {
      return false
    }

    if (maxRating !== null && scenario.rating !== null && scenario.rating > maxRating) {
      return false
    }

    return true
  })
}

export function selectRandomScenario(scenarios, options = {}, random = Math.random) {
  const matches = filterScenarios(scenarios, options)

  if (matches.length === 0) {
    return null
  }

  const randomIndex = Math.min(matches.length - 1, Math.floor(random() * matches.length))
  return matches[randomIndex]
}

export function getRatingRangeLabel(scenarios) {
  const ratings = scenarios
    .map((scenario) => scenario.rating)
    .filter((rating) => typeof rating === 'number')

  if (ratings.length === 0) {
    return 'Rating range: unscored'
  }

  return `Rating range: ${Math.min(...ratings)}-${Math.max(...ratings)}`
}

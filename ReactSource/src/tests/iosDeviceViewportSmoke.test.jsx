import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

const DEFAULT_VIEWPORT = {
  height: window.innerHeight,
  width: window.innerWidth,
}

const IOS_DEVICE_VIEWPORTS = [
  { name: 'iPhone SE portrait', width: 375, height: 667 },
  { name: 'iPhone 15 portrait', width: 393, height: 852 },
  { name: 'iPhone 15 Pro Max landscape', width: 932, height: 430 },
  { name: 'iPad mini portrait', width: 768, height: 1024 },
  { name: 'iPad mini landscape', width: 1024, height: 768 },
  { name: 'iPad Air portrait', width: 820, height: 1180 },
  { name: 'iPad Pro 12.9 landscape', width: 1366, height: 1024 },
]

function mediaQueryMatches(query, viewport) {
  return query.split(',').some((rawQueryPart) => {
    const queryPart = rawQueryPart.toLowerCase()
    const checks = [
      [/\(max-width:\s*(\d+(?:\.\d+)?)px\)/, (value) => viewport.width <= value],
      [/\(min-width:\s*(\d+(?:\.\d+)?)px\)/, (value) => viewport.width >= value],
      [/\(max-height:\s*(\d+(?:\.\d+)?)px\)/, (value) => viewport.height <= value],
      [/\(min-height:\s*(\d+(?:\.\d+)?)px\)/, (value) => viewport.height >= value],
    ]

    const sizeQueriesPass = checks.every(([pattern, test]) => {
      const match = queryPart.match(pattern)

      return match ? test(Number.parseFloat(match[1])) : true
    })
    const orientationMatch = queryPart.match(/\(orientation:\s*(portrait|landscape)\)/)
    const orientationPass = orientationMatch
      ? (orientationMatch[1] === 'portrait') === (viewport.height >= viewport.width)
      : true

    return sizeQueriesPass && orientationPass
  })
}

function createMatchMedia(viewport) {
  return (query) => ({
    matches: mediaQueryMatches(query, viewport),
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  })
}

function setViewport(viewport) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: viewport.width,
  })
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: viewport.height,
  })
  Object.defineProperty(window, 'outerWidth', {
    configurable: true,
    value: viewport.width,
  })
  Object.defineProperty(window, 'outerHeight', {
    configurable: true,
    value: viewport.height,
  })
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: createMatchMedia(viewport),
  })

  window.dispatchEvent(new Event('resize'))
}

async function openPage(user, buttonName) {
  await user.click(screen.getByRole('button', { name: buttonName }))
}

afterEach(() => {
  setViewport(DEFAULT_VIEWPORT)
})

describe.each(IOS_DEVICE_VIEWPORTS)('iOS device viewport smoke: $name', (viewport) => {
  it('loads every playable React route from the Start Menu', async () => {
    const user = userEvent.setup()
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    try {
      setViewport(viewport)
      render(<App />)

      expect(screen.getByRole('main', { name: /^Start menu$/ })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /^Storm Commander$/ })).toBeInTheDocument()

      await openPage(user, /^Random Encounter$/)

      expect(screen.getByRole('grid', { name: /Storm Commander encounter board/i }))
        .toBeInTheDocument()
      expect(screen.getAllByTestId('storm-encounter-square').length).toBeGreaterThan(0)

      await openPage(user, /^Back$/)
      await openPage(user, /^Storm Chess Drill$/)

      expect(screen.getByText('Storm Commander')).toBeInTheDocument()
      expect(screen.getAllByTestId('chess-square')).toHaveLength(64)

      await openPage(user, /^Back$/)
      await openPage(user, /^Basic Chess$/)

      expect(screen.getByText('Basic Chess')).toBeInTheDocument()
      expect(screen.getByText('White to move')).toBeInTheDocument()
      expect(screen.getAllByTestId('chess-square')).toHaveLength(64)
    } finally {
      randomSpy.mockRestore()
    }
  })
})

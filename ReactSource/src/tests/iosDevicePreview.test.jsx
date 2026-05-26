import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

async function openDebugPage(user, pageName) {
  const debugButton = screen.getByRole('button', { name: /^Debug$/ })
  for (let press = 0; press < 6; press += 1) {
    await user.click(debugButton)
  }
  await user.click(screen.getByRole('button', { name: pageName }))
}

afterEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('iPhone device preview', () => {
  it('opens the iPhone preview from debug mode', async () => {
    const user = userEvent.setup()

    render(<App />)

    await openDebugPage(user, /^iPhone Preview$/)

    expect(screen.getByRole('heading', { name: /^iPhone Preview$/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/^iPhone model$/)).toBeInTheDocument()
    expect(screen.getByTitle(/^Storm Commander iPhone preview$/)).toBeInTheDocument()
  })

  it('applies the selected iPhone viewport as exact iframe dimensions', async () => {
    const user = userEvent.setup()

    window.history.replaceState({}, '', '/?storm-view=ios-preview')
    render(<App />)

    await user.selectOptions(screen.getByLabelText(/^iPhone model$/), 'iphone-se')

    const frame = screen.getByTitle(/^Storm Commander iPhone preview$/)

    expect(frame).toHaveAttribute('width', '375')
    expect(frame).toHaveAttribute('height', '667')
    expect(frame).toHaveStyle({ width: '375px', height: '667px' })
    expect(screen.getByText(/^375 x 667$/)).toBeInTheDocument()
  })

  it('swaps the selected iPhone viewport dimensions in landscape', async () => {
    const user = userEvent.setup()

    window.history.replaceState({}, '', '/?storm-view=ios-preview')
    render(<App />)

    await user.selectOptions(screen.getByLabelText(/^iPhone model$/), 'iphone-16-pro-max')
    await user.click(screen.getByRole('button', { name: /^Landscape$/ }))

    const frame = screen.getByTitle(/^Storm Commander iPhone preview$/)

    expect(frame).toHaveAttribute('width', '956')
    expect(frame).toHaveAttribute('height', '440')
    expect(frame).toHaveStyle({ width: '956px', height: '440px' })
    expect(screen.getByText(/^956 x 440$/)).toBeInTheDocument()
  })

  it('renders the random encounter without debug chrome in iframe mode', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    try {
      window.history.replaceState({}, '', '/?storm-view=ios-frame')

      render(<App />)

      expect(screen.getByRole('heading', { name: /^Random Pirate Raid$/ })).toBeInTheDocument()
      expect(screen.getAllByTestId('storm-encounter-square').length).toBeGreaterThan(0)
      expect(screen.queryByRole('button', { name: /^Debug$/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /^iPhone Preview$/ })).not.toBeInTheDocument()
    } finally {
      randomSpy.mockRestore()
    }
  })

  it('centers the fixed screen preview for portrait and landscape widths', () => {
    const globalStyles = readFileSync('src/styles.css', 'utf8')
    const frameShellRule = globalStyles.match(
      /\.ios-preview-frame-shell\s*\{(?<body>[^}]+)\}/,
    )?.groups.body

    expect(frameShellRule).toContain('margin-left: auto;')
    expect(frameShellRule).toContain('margin-right: auto;')
  })
})

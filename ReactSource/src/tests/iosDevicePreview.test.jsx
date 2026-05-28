import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { IOS_PREVIEW_DEVICES } from '../preview/iosDeviceProfiles'

afterEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('iOS device preview', () => {
  it('opens the iOS preview from query mode without debug chrome', () => {
    window.history.replaceState({}, '', '/?storm-view=ios-preview')

    render(<App />)

    expect(screen.getByRole('heading', { name: /^iOS Preview$/ })).toBeInTheDocument()
    expect(screen.getByLabelText(/^Device model$/)).toBeInTheDocument()
    expect(screen.getByTitle(/^Storm Commander iOS preview$/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Debug$/ })).not.toBeInTheDocument()
  })

  it('includes iPad CSS viewport profiles', () => {
    expect(IOS_PREVIEW_DEVICES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'ipad-mini',
          family: 'iPad',
          width: 744,
          height: 1133,
        }),
        expect.objectContaining({
          id: 'ipad-air-11',
          family: 'iPad',
          width: 820,
          height: 1180,
        }),
        expect.objectContaining({
          id: 'ipad-pro-13',
          family: 'iPad',
          width: 1032,
          height: 1376,
        }),
      ]),
    )
  })

  it('applies the selected iOS viewport as exact iframe dimensions', async () => {
    const user = userEvent.setup()

    window.history.replaceState({}, '', '/?storm-view=ios-preview')
    render(<App />)

    await user.selectOptions(screen.getByLabelText(/^Device model$/), 'iphone-se')

    const frame = screen.getByTitle(/^Storm Commander iOS preview$/)

    expect(frame).toHaveAttribute('width', '375')
    expect(frame).toHaveAttribute('height', '667')
    expect(frame).toHaveStyle({ width: '375px', height: '667px' })
    expect(screen.getByText(/^375 x 667$/)).toBeInTheDocument()
  })

  it('swaps the selected iPhone viewport dimensions in landscape', async () => {
    const user = userEvent.setup()

    window.history.replaceState({}, '', '/?storm-view=ios-preview')
    render(<App />)

    await user.selectOptions(screen.getByLabelText(/^Device model$/), 'iphone-16-pro-max')
    await user.click(screen.getByRole('button', { name: /^Landscape$/ }))

    const frame = screen.getByTitle(/^Storm Commander iOS preview$/)

    expect(frame).toHaveAttribute('width', '956')
    expect(frame).toHaveAttribute('height', '440')
    expect(frame).toHaveStyle({ width: '956px', height: '440px' })
    expect(screen.getByText(/^956 x 440$/)).toBeInTheDocument()
  })

  it('swaps the selected iPad viewport dimensions in landscape', async () => {
    const user = userEvent.setup()

    window.history.replaceState({}, '', '/?storm-view=ios-preview')
    render(<App />)

    await user.selectOptions(screen.getByLabelText(/^Device model$/), 'ipad-pro-13')
    await user.click(screen.getByRole('button', { name: /^Landscape$/ }))

    const frame = screen.getByTitle(/^Storm Commander iOS preview$/)

    expect(frame).toHaveAttribute('width', '1376')
    expect(frame).toHaveAttribute('height', '1032')
    expect(frame).toHaveStyle({ width: '1376px', height: '1032px' })
    expect(screen.getByText(/^1376 x 1032$/)).toBeInTheDocument()
  })

  it('renders the random encounter without debug chrome in iframe mode', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    try {
      window.history.replaceState({}, '', '/?storm-view=ios-frame')

      render(<App />)

      expect(screen.getByRole('heading', { name: /^Random Pirate Raid$/ })).toBeInTheDocument()
      expect(screen.getAllByTestId('storm-encounter-square').length).toBeGreaterThan(0)
      expect(screen.queryByRole('button', { name: /^Debug$/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /^iOS Preview$/ })).not.toBeInTheDocument()
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

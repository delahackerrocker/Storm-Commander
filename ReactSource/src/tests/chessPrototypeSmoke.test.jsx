import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'
import { dismissOpeningRadio } from './radioTestHelpers'

async function openStartMenuPage(user, pageName) {
  await user.click(screen.getByRole('button', { name: pageName }))
  await screen.findByRole('dialog', { name: 'Pirate radio transmission' })
}

describe('Chess-ish prototype', () => {
  it('starts with only Press to Play', () => {
    render(<App />)

    expect(screen.getByRole('main', { name: /^Start menu$/ })).toBeInTheDocument()
    expect(screen.queryByText(/^Start Menu$/)).not.toBeInTheDocument()
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Press to Play',
    ])
    expect(screen.getByRole('main').textContent).toBe('Press to Play')
    expect(screen.queryByRole('button', { name: /^Debug$/ })).not.toBeInTheDocument()
  })

  it('opens random encounter from the Start Menu without showing the Debug menu', async () => {
    const user = userEvent.setup()
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    try {
      const { container } = render(<App />)

      await openStartMenuPage(user, /^Press to Play$/)

      const playControls = container.querySelector('.play-controls')
      const backButton = screen.getByRole('button', { name: /^back$/i })
      const missionButton = screen.getByRole('button', {
        name: /Mission status\. Objective: .+\. Progress: .+\. Open mission briefing\./,
      })

      expect(screen.getByRole('dialog', { name: 'Pirate radio transmission' })).toBeInTheDocument()
      expect(screen.getAllByTestId('storm-encounter-square').length).toBeGreaterThan(0)
      expect(playControls).toContainElement(backButton)
      expect(playControls).toContainElement(missionButton)
      expect(
        backButton.compareDocumentPosition(missionButton) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
      expect(container.querySelector('.page-topbar .back-button')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^Debug$/ })).not.toBeInTheDocument()
    } finally {
      randomSpy.mockRestore()
    }
  })

  it('returns to the single play button and can start again', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.tab()
    await user.keyboard('{Enter}')
    await screen.findByRole('dialog', { name: 'Pirate radio transmission' })
    expect(screen.getAllByTestId('storm-encounter-square').length).toBeGreaterThan(0)
    await dismissOpeningRadio(user)
    await user.click(screen.getByRole('button', { name: /^back$/i }))
    expect(screen.getAllByRole('button')).toHaveLength(1)
    await openStartMenuPage(user, /^Press to Play$/)
    expect(screen.getAllByTestId('storm-encounter-square').length).toBeGreaterThan(0)
    expect(screen.queryByTestId('chess-square')).not.toBeInTheDocument()
  })
})

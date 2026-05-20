import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'

describe('Storm Commander random encounter UI', () => {
  it('generates an encounter and shows the selected Pirate cockpit panel', async () => {
    const user = userEvent.setup()
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)

    try {
      render(<App />)

      await user.click(screen.getByRole('button', { name: /^Storm Commander$/ }))
      await user.click(screen.getByRole('button', { name: /^New Random Encounter$/ }))

      expect(screen.getByRole('heading', { name: /^Random Pirate Raid$/ })).toBeInTheDocument()
      expect(screen.getByText(/Objective:/)).toBeInTheDocument()
      expect(screen.getAllByTestId('storm-encounter-square').length).toBe(25)

      await user.click(screen.getAllByRole('button', { name: /Pirate .* square/i })[0])

      expect(screen.getByRole('img', { name: /Pirate .* cockpit placeholder/i })).toBeInTheDocument()
      expect(screen.getByText(/Movement:/)).toBeInTheDocument()
      expect(screen.getByText(/Pirate .* Pilot/i)).toBeInTheDocument()
    } finally {
      randomSpy.mockRestore()
    }
  })
})

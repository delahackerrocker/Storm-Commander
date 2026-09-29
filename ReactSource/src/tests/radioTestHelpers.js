import { expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'

export async function dismissOpeningRadio(user) {
  await screen.findByRole('dialog', { name: 'Pirate radio transmission' })
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue transmission' })).toBeEnabled(), { timeout: 2200 })
  await user.click(screen.getByRole('button', { name: 'Continue transmission' }))
  await screen.findByRole('dialog', { name: 'Enemy radio transmission' })
  await user.click(screen.getByRole('button', { name: 'Continue transmission' }))
  await waitFor(() => expect(screen.queryByRole('dialog', { name: /radio transmission/ })).not.toBeInTheDocument())
}

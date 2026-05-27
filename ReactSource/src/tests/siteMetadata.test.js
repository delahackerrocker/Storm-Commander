import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('site metadata', () => {
  it('brands the browser tab and emits an ICO favicon source', () => {
    const indexHtml = readFileSync('index.html', 'utf8')
    const faviconBytes = readFileSync('public/favicon.ico')

    expect(indexHtml).toContain('<title>Storm Commander</title>')
    expect(indexHtml).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />',
    )
    expect(indexHtml).toContain(
      '<link rel="icon" type="image/x-icon" href="%BASE_URL%favicon.ico" />',
    )
    expect([...faviconBytes.subarray(0, 4)]).toEqual([0, 0, 1, 0])
    expect(faviconBytes.length).toBeGreaterThan(1024)
  })
})

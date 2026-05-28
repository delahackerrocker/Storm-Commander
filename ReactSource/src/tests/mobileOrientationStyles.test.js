import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function getMediaBlock(css, query) {
  const mediaStart = css.indexOf(query)

  if (mediaStart < 0) {
    return ''
  }

  const openingBrace = css.indexOf('{', mediaStart)
  let depth = 0

  for (let index = openingBrace; index < css.length; index += 1) {
    const character = css[index]

    if (character === '{') {
      depth += 1
    }

    if (character === '}') {
      depth -= 1

      if (depth === 0) {
        return css.slice(openingBrace + 1, index)
      }
    }
  }

  return ''
}

describe('Storm Commander mobile orientation styles', () => {
  it('keeps random encounters viewport-locked and lets only mission dialogs scroll', () => {
    const stormStyles = readFileSync('src/styles/stormCommander.css', 'utf8')
    const encounterRootRule = stormStyles.match(
      /\.storm-commander-root\.storm-encounter-root\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const missionOverlayRule = stormStyles.match(
      /\.storm-commander-root \.storm-mission-overlay\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const missionDialogRule = stormStyles.match(
      /\.storm-commander-root \.storm-mission-dialog\s*\{(?<body>[^}]+)\}/,
    )?.groups.body
    const missionDismissRule = stormStyles.match(
      /\.storm-commander-root \.storm-mission-dismiss\s*\{(?<body>[^}]+)\}/,
    )?.groups.body

    expect(encounterRootRule).toContain('height: 100dvh;')
    expect(encounterRootRule).toContain('padding-top: 0;')
    expect(encounterRootRule).toContain('overflow: hidden;')
    expect(missionOverlayRule).toContain('overflow: hidden;')
    expect(missionDialogRule).toContain('overflow-x: hidden;')
    expect(missionDialogRule).toContain('overflow-y: auto;')
    expect(missionDismissRule).toContain('justify-self: end;')
  })

  it('defines separate mobile portrait and landscape encounter rules', () => {
    const stormStyles = readFileSync('src/styles/stormCommander.css', 'utf8')
    const portraitRules = getMediaBlock(
      stormStyles,
      '@media (max-width: 560px) and (orientation: portrait)',
    )
    const landscapeRules = getMediaBlock(
      stormStyles,
      '@media (max-width: 1376px) and (orientation: landscape)',
    )

    expect(portraitRules).toContain('.storm-commander-root .storm-encounter-shell')
    expect(portraitRules).toContain('.storm-commander-root.storm-encounter-root')
    expect(portraitRules).toContain('padding-top: env(safe-area-inset-top, 0px);')
    expect(portraitRules).toContain('grid-template-columns: 1fr;')
    expect(portraitRules).toContain('"opponent-comms"')
    expect(portraitRules).toContain('"board"')
    expect(portraitRules).toContain('"player-comms";')
    expect(portraitRules).toContain('width: min(720px, calc(100vw - 24px));')
    expect(portraitRules).toContain('grid-template-columns: 43px 43px minmax(0, 1fr);')

    expect(landscapeRules).toContain('.storm-commander-root .storm-encounter-shell')
    expect(landscapeRules).not.toBe('')
    expect(landscapeRules).toContain(
      'grid-template-columns: minmax(180px, 250px) minmax(320px, 760px) minmax(180px, 250px);',
    )
    expect(landscapeRules).toContain('grid-template-areas: "opponent-comms board player-comms";')
    expect(landscapeRules).toContain('gap: 12px;')
    expect(landscapeRules).toContain('width: min(1320px, calc(100vw - 12px));')
    expect(landscapeRules).toContain('padding: 8px 0;')
    expect(landscapeRules).toContain('padding: 10px;')
    expect(landscapeRules).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));')
    expect(landscapeRules).toContain('"portrait movement"')
    expect(landscapeRules).toContain('"title title";')
  })
})

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = resolve(import.meta.dirname, '../../..')
const iosSourceRoot = resolve(repoRoot, 'iOS_Source')

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

describe('iOS_Source Capacitor wrapper config', () => {
  it('keeps iOS packaging in the root iOS_Source folder', () => {
    const packageJson = readJson(resolve(iosSourceRoot, 'package.json'))
    const capacitorConfig = readJson(resolve(iosSourceRoot, 'capacitor.config.json'))

    expect(packageJson.name).toBe('storm-commander-ios')
    expect(packageJson.private).toBe(true)
    expect(packageJson.dependencies).toMatchObject({
      '@capacitor/assets': '^3.0.5',
      '@capacitor/cli': '^8.0.0',
      '@capacitor/core': '^8.0.0',
      '@capacitor/ios': '^8.0.0',
    })
    expect(packageJson.scripts).toMatchObject({
      'build:web':
        'npm --prefix ../ReactSource exec vite -- build ../ReactSource --base=./ --outDir ../iOS_Source/dist --emptyOutDir',
      'ios:add': 'npx cap add ios',
      'ios:assets': 'npx capacitor-assets generate --ios',
      'ios:open': 'npx cap open ios',
      'ios:run': 'npm run ios:sync && npx cap run ios',
      'ios:sync': 'npm run build:web && npx cap sync ios',
    })
    expect(capacitorConfig).toEqual({
      appId: 'digital.practitioner.stormcommander',
      appName: 'Storm Commander',
      webDir: 'dist',
      ios: {
        path: 'ios',
      },
    })
  })
})

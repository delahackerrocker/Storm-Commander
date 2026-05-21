import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const STORM_COMMANDER_DEPLOY_BASE = '/storm_commander/'

function stormCommanderDevAssetBase() {
  return {
    name: 'storm-commander-dev-asset-base',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url?.startsWith(`${STORM_COMMANDER_DEPLOY_BASE}assets/`)) {
          request.url = request.url.replace(STORM_COMMANDER_DEPLOY_BASE, '/')
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stormCommanderDevAssetBase()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
  },
})

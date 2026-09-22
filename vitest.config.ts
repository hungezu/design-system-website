import { defineConfig, mergeConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import viteConfig from './vite.config'
// Match browser bundling for the legacy palette engine's extensionless ESM imports.
export default mergeConfig(viteConfig, defineConfig({
  resolve: { alias: {
    'tvision-color': fileURLToPath(new URL('./node_modules/tvision-color/dist/esm/index.js', import.meta.url)),
    '@material/material-color-utilities': fileURLToPath(new URL('./node_modules/@material/material-color-utilities/dist/index.js', import.meta.url)),
  } },
  test: { server: { deps: { inline: [/tvision-color/, /material-color-utilities/] } } },
}))

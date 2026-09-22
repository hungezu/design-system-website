import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
export default defineConfig({ plugins: [react()], resolve: { alias: {
  // Use the package's portable decoder: its browser entry touches document at import
  // time, preventing the archive verifier from loading the compiled module in Node.
  'decode-named-character-reference': fileURLToPath(import.meta.resolve('decode-named-character-reference')),
} }, build: {
  outDir: 'dist-project-runtime', emptyOutDir: true,
  copyPublicDir: false,
  lib: { entry: 'src/delivery/project-runtime.ts', formats: ['es'], fileName: 'runtime', cssFileName: 'style' },
  rollupOptions: { external: id => /^(react|react-dom)(\/|$)/.test(id) },
} })

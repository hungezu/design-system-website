import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({plugins:[react()],build:{outDir:'dist-library',emptyOutDir:true,lib:{entry:'src/delivery/index.ts',formats:['es'],fileName:'design-system',cssFileName:'style'},rollupOptions:{external:id=>/^(react|react-dom)(\/|$)/.test(id)}}})

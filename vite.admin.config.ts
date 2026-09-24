import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Separate bundle: demo lead examples never enter the public site's JavaScript.
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'dist/administrator/assets',
    emptyOutDir: true,
    sourcemap: false,
    lib: { entry: 'src/admin/production-entry.tsx', formats: ['es'], fileName: 'admin-app', cssFileName: 'admin-app' },
  },
})

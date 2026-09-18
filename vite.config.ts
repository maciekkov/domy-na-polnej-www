import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets/build',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        home: 'index.html',
        ...Object.fromEntries(['a', 'b', 'c', 'd', 'e'].map(id => [id, `dom-${id}/index.html`])),
      },
    },
  },
})

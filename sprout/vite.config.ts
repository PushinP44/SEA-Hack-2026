import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite dev server proxies /api to the Express server so the Claude key stays server-side.
// PAGES_BASE is set by the GitHub Pages workflow to the repo subpath ("/SEA-Hack-2026/");
// locally it's unset, so the app is served from "/".
export default defineConfig({
  base: process.env.PAGES_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})

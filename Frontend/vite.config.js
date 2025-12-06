import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  },
  server: {
    middlewareMode: false,
    historyApiFallback: true
  },
  preview: {
    port: 4173,
    strictPort: false
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  plugins: [
    react({
      include: "**/*.{jsx,tsx,js,ts}",
      jsxRuntime: 'automatic'
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'Soulsafe',
        short_name: 'Soulsafe',
        description: 'AI-Driven Personal Digital Time Capsule',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',
        start_url: '/',
        icons: []
      }
    })
  ],
  test: {
    environment: 'jsdom'
  }
})

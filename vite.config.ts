import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const pagesBase = '/quit-zyn/'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isPages = mode === 'pages'
  const base = isPages ? pagesBase : '/'
  const assetPath = (path: string) => `${base}${path}`

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifestFilename: 'manifest.webmanifest',
        includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        },
        manifest: {
          name: 'Pouchless',
          short_name: 'Pouchless',
          description: 'A calm quitting companion for nicotine pouches.',
          start_url: assetPath('#/today'),
          scope: base,
          display: 'standalone',
          background_color: '#f8fafc',
          theme_color: '#134e4a',
          icons: [
            {
              src: assetPath('icons/icon-192.png'),
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: assetPath('icons/icon-512.png'),
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: assetPath('icons/icon-512.png'),
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: false,
      css: true,
    },
  }
})

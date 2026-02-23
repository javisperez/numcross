import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// 👉 Change 'numcross' below to match your exact GitHub repo name
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/numcross/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    ...(command === 'build' ? [VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'NumCross',
        short_name: 'NumCross',
        description: 'Infinite procedural arithmetic crossword puzzle',
        theme_color: '#181c28',
        background_color: '#181c28',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    })] : []),
  ],
}))

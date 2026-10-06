import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Car Dealer',
        short_name: 'Car Dealer',
        description: 'Find and buy quality vehicles.',
        start_url: '/',
        display: 'standalone',
        theme_color: '#000000',
        background_color: '#ffffff',

        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],

  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4242',
    },
  },
})
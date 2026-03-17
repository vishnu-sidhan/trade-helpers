import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Trade Helpers',
        short_name: 'TradeHelpers',
        description: 'Premium Option Exit Calculator and Trading Tools',
        theme_color: '#0f0c29',
        background_color: '#0f0c29',
        display: 'standalone',
        icons: [
          {
            src: 'https://placehold.co/192x192/7c3aed/white.png?text=TH',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://placehold.co/512x512/7c3aed/white.png?text=TH',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'htnleafgooglenews.png'],
      manifest: {
        name: 'Hold the North',
        short_name: 'HTN',
        description: 'Independent Canadian news curation and commentary.',
        theme_color: '#0d0d0d',
        background_color: '#0d0d0d',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'htnleafgooglenews.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'htnleafgooglenews.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/rss-proxy': {
        target: 'https://api.rss2json.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss-proxy/, ''),
      }
    }
  }
})
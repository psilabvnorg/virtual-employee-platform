import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  optimizeDeps: {
    exclude: ['tesseract.js'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Disable SW in Capacitor — it runs on https://localhost and caches assets
      // aggressively, making every code change require a full app uninstall to pick up.
      selfDestroying: process.env.CAPACITOR === '1',
      manifest: {
        name: 'Doc Vault',
        short_name: 'DocVault',
        description: 'Capture and manage documents on the go',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});

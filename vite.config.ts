import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  base: './', // Necessary for Electron file:// protocol resolution
  server: {
    host: '0.0.0.0', // Listen on all local and LAN IP addresses (e.g. 192.168.101.4)
    port: 5180,
    strictPort: false
  },
  preview: {
    host: '0.0.0.0',
    port: 5180
  }
})

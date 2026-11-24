import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // numéro de version des images : change à chaque build, les téléphones rechargent les nouveaux visuels
  define: { __ASSET_V__: JSON.stringify(Date.now().toString(36)) },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})

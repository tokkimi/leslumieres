import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // numéro de version des images : change à chaque build, les téléphones rechargent les nouveaux visuels
  define: { __ASSET_V__: JSON.stringify(Date.now().toString(36)) },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  // site + écrans TV du comptoir (ecran.html?n=1..3) + aperçu des 3 écrans (ecrans.html)
  // Les écrans TV ne sont pas publiés sur le site : on les construit seulement en local (TV=1) pour exporter les vidéos.
  build: { rollupOptions: { input: process.env.TV ? { main: path.resolve(__dirname, 'index.html'), ecran: path.resolve(__dirname, 'ecran.html'), ecrans: path.resolve(__dirname, 'ecrans.html') } : { main: path.resolve(__dirname, 'index.html') } } },
})

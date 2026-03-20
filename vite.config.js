import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Gunakan './' agar path menjadi relatif dan aman untuk Vercel
  base: './', 
  build: {
    outDir: 'dist',
  }
})

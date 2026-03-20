import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Pastikan ini sama persis dengan nama repo di URL GitHub Anda
  base: '/SURAT-PENERIMAAN-LAPORAN/', 
  build: {
    outDir: 'dist',
  }
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Ganti base menjadi path subfolder di domain Anda
  base: '/SURAT-PENERIMAAN-LAPORAN-BAP-NOVA/', 
  build: {
    outDir: 'dist',
  }
})

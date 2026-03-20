export default defineConfig({
  plugins: [react()],
  base: '/', // Kembali ke root agar aset terpanggil di domain utama
  build: {
    outDir: 'dist',
  }
})

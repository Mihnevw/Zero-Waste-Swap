import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          mui: ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  define: {
    'process.env': {},
  },
})

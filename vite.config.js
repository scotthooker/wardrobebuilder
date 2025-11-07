import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // For static deployment (GitHub Pages, Netlify, Vercel)
  base: './', // Use relative paths

  // Development server configuration
  server: {
    host: true, // Listen on all addresses (needed for Docker)
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Enable polling for file changes in Docker
    },
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable for production
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'data-vendor': ['zustand', 'papaparse']
        }
      }
    }
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'papaparse', 'lucide-react']
  }
})

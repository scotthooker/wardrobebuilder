import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/theme': path.resolve(__dirname, './src/theme'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/models': path.resolve(__dirname, './src/models'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/constants': path.resolve(__dirname, './src/constants'),
      '@/utils': path.resolve(__dirname, './src/utils')
    }
  },

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

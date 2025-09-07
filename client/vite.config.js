// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteImagemin from 'vite-plugin-imagemin';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react({
      // Skip ESLint during build
      eslint: false,
    }),
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.7, 0.8],
        speed: 4,
      },
      webp: {
        quality: 75,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
        ],
      },
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        ws: true
      }
    }
  },
  build: {
    // Optimize build output
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['antd', '@ant-design/icons'],
          animations: ['framer-motion', 'animate.css'],
          charts: ['chart.js', 'react-chartjs-2', 'recharts'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          firebase: [
            'firebase/app', 
            'firebase/auth', 
            'firebase/firestore',
            'firebase/storage'
          ],
        },
        // Improve caching by using deterministic names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
    // Enable tree shaking
    emptyOutDir: true,
    // Use Brotli compression for even smaller files
    brotliSize: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios', 'antd', 'react-redux', '@reduxjs/toolkit'],
  },
  // Enable compression
  esbuild: {
    drop: ['console', 'debugger'],
  },
});
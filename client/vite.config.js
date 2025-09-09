import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteImagemin from 'vite-plugin-imagemin';
import viteCompression from 'vite-plugin-compression';
import path from 'path';

export default defineConfig({
  plugins: [
    react(), 
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
    // Gzip compression
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
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
        ws: true,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: process.env.NODE_ENV === 'development',
    cssCodeSplit: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
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
            'firebase/storage',
          ],
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(extType)) {
            extType = 'img';
          } else if (/woff|woff2|ttf|otf|eot/i.test(extType)) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
      },
      input: {
        main: path.resolve(process.cwd(), 'index.html')
      }
    },
    chunkSizeWarningLimit: 1500,
    emptyOutDir: true,
    assetsInlineLimit: 4096,
    reportCompressedSize: false
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'axios',
      'antd',
      'react-redux',
      '@reduxjs/toolkit',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      '@components': path.resolve(process.cwd(), './src/components'),
      '@pages': path.resolve(process.cwd(), './src/pages'),
      '@store': path.resolve(process.cwd(), './src/store'),
      '@assets': path.resolve(process.cwd(), './src/assets'),
      '@styles': path.resolve(process.cwd(), './src/styles'),
      '@utils': path.resolve(process.cwd(), './src/utils'),
      '@hooks': path.resolve(process.cwd(), './src/hooks'),
      '@config': path.resolve(process.cwd(), './src/config'),
      '@api': path.resolve(process.cwd(), './src/api')
    }
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
});

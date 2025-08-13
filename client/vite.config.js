// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Or 3000, depending on your preference
    host: 'localhost', // Allows access from network, or 'localhost' for local only
  },
});
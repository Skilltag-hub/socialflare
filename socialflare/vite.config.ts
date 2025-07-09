import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.glb'],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      external: ['mongodb'],
    },
  },
  // Exclude /api from Vite's build
  publicDir: 'public',
});

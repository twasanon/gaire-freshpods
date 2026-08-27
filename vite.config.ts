import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // three + the R3F layer are only needed once the viewer mounts, so they
        // are kept out of the entry chunk that gates first paint.
        manualChunks(id) {
          // Vite's dynamic-import helper is shared between the entry and the
          // 3D libraries, so Rollup would otherwise host it inside the r3f
          // chunk — one 300-byte function that drags 330 KB into first paint.
          if (id.includes('vite/preload-helper')) return 'preload';

          if (id.includes('node_modules')) {
            // React first, and in its own chunk: left to group itself it ends up
            // inside the r3f chunk, which gives the entry a static edge to
            // three.js and preloads 330 KB the first paint does not need.
            if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
            if (/[\\/]three[\\/]/.test(id)) return 'three';
            if (/@react-three|three-stdlib|meshoptimizer|troika/.test(id)) return 'r3f';
            if (/[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion';
          }
        },
      },
    },
  },
});

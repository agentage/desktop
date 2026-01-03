import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import electronRenderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/index.ts',
        vite: {
          build: {
            outDir: 'dist/main',
            lib: {
              // Output as ESM to support dynamic imports of ESM modules like linkedom
              entry: 'src/main/index.ts',
              formats: ['es'],
              fileName: () => 'index.js',
            },
            rollupOptions: {
              // Externalize linkedom and readability for dynamic import at runtime
              // They're ESM packages that work with Node's native ESM loader
              external: ['electron', 'linkedom', '@mozilla/readability'],
            },
          },
        },
      },
      {
        entry: 'src/main/preload.ts',
        onstart: (options) => {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist/preload',
            lib: {
              entry: 'src/main/preload.ts',
              formats: ['cjs'],
              fileName: () => 'preload.js',
            },
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
    electronRenderer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@main': resolve(__dirname, 'src/main'),
      '@renderer': resolve(__dirname, 'src/renderer'),
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
});

import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  // Set this to your repo name (e.g., '/your-repo-name/') for GitHub Pages
  base: (process.env as any).VITE_BASE_PATH || '/',
  build: {
    target: 'esnext',
    rollupOptions: {
      plugins: [
        visualizer({
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
      ],
    },
  },
  server: { port: 5173 },
} as const);

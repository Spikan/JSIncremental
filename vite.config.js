import { defineConfig } from 'vite';

export default defineConfig({
  // Set this to your repo name (e.g., '/your-repo-name/') for GitHub Pages
  base: process.env.VITE_BASE_PATH || '/',
  server: { port: 5173 },
});



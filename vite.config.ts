import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  // Set this to your repo name (e.g., '/your-repo-name/') for GitHub Pages
  base: (process.env as any).VITE_BASE_PATH || '/',

  build: {
    target: 'esnext',

    // Enable source maps for better debugging
    sourcemap: false, // Disable for production to reduce size

    // Optimize minification - less aggressive to avoid variable conflicts
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'] as string[],
        // Reduce aggressive optimizations that can cause variable conflicts
        sequences: false,
        booleans: false,
        collapse_vars: false,
        reduce_vars: false,
      },
      mangle: {
        // Keep longer variable names to avoid conflicts
        keep_fnames: true,
        reserved: [
          'f',
          'g',
          'h',
          'i',
          'j',
          'k',
          'l',
          'm',
          'n',
          'o',
          'p',
          'q',
          'r',
          's',
          't',
          'u',
          'v',
          'w',
          'x',
          'y',
          'z',
        ],
      },
    },

    // Enable compression
    reportCompressedSize: true,

    // Optimize CSS
    cssMinify: true,

    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        // Split vendor libraries for better caching
        manualChunks: (id: string) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('zustand')) return 'vendor-zustand';
            if (id.includes('zod')) return 'vendor-zod';
            return 'vendor';
          }

          // Core game modules
          if (id.includes('/core/state/') || id.includes('/core/rules/')) {
            return 'game-core';
          }

          // UI modules
          if (id.includes('/ui/') || id.includes('/services/')) {
            return 'game-ui';
          }

          // Game systems
          if (
            id.includes('/core/systems/') ||
            id.includes('feature-unlocks') ||
            id.includes('god.ts')
          ) {
            return 'game-systems';
          }

          // Default chunk
          return 'index';
        },

        // Optimize asset naming
        assetFileNames: assetInfo => {
          const info = assetInfo.name?.split('.') ?? [];
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name ?? '')) {
            return `assets/index-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|webp)$/.test(assetInfo.name ?? '')) {
            return `assets/[name]-[hash].${ext}`;
          }
          if (/\.(json)$/.test(assetInfo.name ?? '')) {
            return `assets/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },

        chunkFileNames: 'assets/[name]-[hash].js',
      },

      plugins: [
        visualizer({
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
      ] as any[],
    },
  },

  server: {
    port: 5173,

    // Enable compression for better development performance
    fs: {
      // Allow serving files from one level up to find word_bank.json
      allow: ['..'] as string[],
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['zustand', 'zod'] as string[],

    // Exclude large dependencies that should be bundled
    exclude: [] as string[],
  },
} as const);

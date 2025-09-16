import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';

// Helper function to get base path for deployment
function getBasePath(): string {
  return (
    (process.env as any).VITE_BASE_PATH ||
    ((process.env as any).GITHUB_REPOSITORY
      ? `/${String((process.env as any).GITHUB_REPOSITORY).split('/')[1]}/`
      : '/')
  );
}

// Helper function to create manual chunks configuration
function createManualChunks(id: string): string {
  // Vendor libraries
  if (id.includes('node_modules')) {
    if (id.includes('zustand')) return 'vendor-zustand';
    if (id.includes('zod')) return 'vendor-zod';
    return 'vendor';
  }

  // Core game modules
  if (id.includes('/core/state/') || id.includes('/core/rules/') || id.includes('/core/numbers/')) {
    return 'game-core';
  }

  // UI modules
  if (id.includes('/ui/') || id.includes('/services/')) {
    return 'game-ui';
  }

  // Game systems
  if (id.includes('/core/systems/') || id.includes('feature-unlocks') || id.includes('god.ts')) {
    return 'game-systems';
  }

  // Default chunk
  return 'index';
}

// Helper function to create asset file names
function createAssetFileNames(assetInfo: any): string {
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
  if (/\.(glb|gltf)$/.test(assetInfo.name ?? '')) {
    return `assets/[name]-[hash].${ext}`;
  }
  return `assets/[name]-[hash].${ext}`;
}

export default defineConfig(({ mode }) => {
  const isAnalyze = mode === 'analyze';

  return {
    base: getBasePath(),

    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,glb,ttf}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cdn-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
            {
              urlPattern: /^https:\/\/unpkg\.com/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'unpkg-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
          ],
        },
        manifest: {
          name: 'Soda Clicker Pro',
          short_name: 'SodaClicker',
          description: 'The Ultimate Soda Drinking Experience - An incremental idle game',
          theme_color: '#1a1a2e',
          background_color: '#16213e',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'images/pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'images/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'images/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'images/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          categories: ['games', 'entertainment'],
          lang: 'en',
          dir: 'ltr',
          id: 'soda-clicker-pro',
          display_override: ['window-controls-overlay', 'standalone'],
        },
      }),
    ],

    build: {
      target: 'esnext',
      sourcemap: isAnalyze ? true : false,
      minify: isAnalyze ? false : 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production' && !isAnalyze,
          drop_debugger: true,
          pure_funcs:
            mode === 'production'
              ? ['console.log', 'console.info', 'console.debug', 'console.trace']
              : [],
        },
      },
      reportCompressedSize: true,
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: createManualChunks,
          assetFileNames: createAssetFileNames,
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
      copyPublicDir: true,
    },

    server: {
      port: 5173,
      fs: {
        allow: ['..'] as string[],
      },
    },

    optimizeDeps: {
      include: ['zustand', 'zod'] as string[],
      exclude: ['@google/model-viewer'] as string[],
    },
  };
});

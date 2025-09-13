import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

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
  return `assets/[name]-[hash].${ext}`;
}

export default defineConfig(({ mode }) => {
  const isAnalyze = mode === 'analyze';

  return {
    base: getBasePath(),

    build: {
      target: 'esnext',
      sourcemap: isAnalyze ? true : false,
      minify: isAnalyze ? false : 'terser',
      terserOptions: {
        compress: {
          drop_console: isAnalyze ? false : true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'] as string[],
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
    },

    server: {
      port: 5173,
      fs: {
        allow: ['..'] as string[],
      },
    },

    optimizeDeps: {
      include: ['zustand', 'zod'] as string[],
      exclude: [] as string[],
    },
  } as const;
});

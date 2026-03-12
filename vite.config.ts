import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

// Vite plugin to strip "use client" directives from framer-motion ESM builds to silence
// module-level directive warnings during bundling. This does not change behavior.
const stripFramerMotionUseClient: any = {
  name: 'strip-framer-motion-use-client',
  enforce: 'pre',
  transform(code: string, id: string) {
    if (!id.includes('node_modules/framer-motion/dist/es/')) return null;
    const stripped = code.replace(/^\s*["']use client["'];?\s*/m, '');
    return { code: stripped, map: null };
  },
};

// Helper function to get base path for deployment
function getBasePath(): string {
  return (
    (process.env as any).VITE_BASE_PATH ||
    ((process.env as any).GITHUB_REPOSITORY
      ? `/${String((process.env as any).GITHUB_REPOSITORY).split('/')[1]}/`
      : '/')
  );
}

// Keep manual chunking limited to stable third-party boundaries. The app's
// internal modules still have circular runtime relationships, so forcing them
// into separate manual chunks creates Rollup circular chunk warnings.
function createManualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined;
  if (id.includes('/three/examples/jsm/')) return 'vendor-three-extras';
  if (id.includes('/three/build/three.core.js')) return 'vendor-three-core';
  if (id.includes('/three/')) return 'vendor-three';
  if (
    id.includes('/framer-motion/') ||
    id.includes('/motion-dom/') ||
    id.includes('/motion-utils/') ||
    id.includes('/react/')
  ) {
    return 'vendor-motion';
  }
  if (id.includes('zustand')) return 'vendor-zustand';
  if (id.includes('zod')) return 'vendor-zod';
  return 'vendor';
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
  const base = getBasePath();

  return {
    base,

    plugins: [stripFramerMotionUseClient],

    build: {
      target: 'esnext',
      sourcemap: isAnalyze ? true : false,
      minify: isAnalyze ? false : 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // Temporarily disable console removal for debugging
          drop_debugger: true,
          pure_funcs: [], // Temporarily disable function removal for debugging
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
            open: isAnalyze ? true : false,
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

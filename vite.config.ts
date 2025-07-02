
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";
import path from 'path';
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: true,
      timeout: 120000
    },
    watch: {
      usePolling: true,
      interval: 500
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      util: 'util/',
      buffer: 'buffer/',
      crypto: 'crypto-browserify',
      http: 'stream-http',
      https: 'https-browserify',
      url: 'url/',
      punycode: 'punycode/',
      process: 'process/browser',
      assert: 'assert/',
      events: 'events/'
    },
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext', 'main']
  },
  optimizeDeps: {
    force: true,
    exclude: ['@capacitor/app'],
    include: [
      '@react-pdf/renderer',
      '@react-pdf/font',
      '@react-pdf/pdfkit',
      'buffer',
      'process',
      'util',
      'stream-browserify',
      'browserify-zlib',
      'crypto-browserify',
      'stream-http',
      'https-browserify',
      'assert',
      'events'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
        'process.env.NODE_DEBUG': 'false'
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: mode === 'development',
    rollupOptions: {
      cache: false,
      external: ['@capacitor/app'],
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('src/components')) {
            return 'components';
          }
          if (id.includes('src/pages')) {
            return 'pages';
          }
        }
      }
    },
    cssCodeSplit: true,
    minify: mode !== 'development',
    write: true,
    copyPublicDir: true,
    chunkSizeWarningLimit: 1000
  },
  define: {
    'process.env.NODE_DEBUG': 'false',
    'global': 'globalThis',
    'process.env': {}
  },
  clearScreen: false
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";
import path from 'path';

export default defineConfig(({ mode }) => ({
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
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      util: 'util/',  // Updated path for util
      buffer: 'buffer/',  // Updated path for buffer
      crypto: 'crypto-browserify',
      http: 'stream-http',
      https: 'https-browserify',
      url: 'url/',  // Updated path for url
      punycode: 'punycode/',
      process: 'process/browser',
      assert: 'assert/',  // Added assert polyfill
      events: 'events/'  // Added events polyfill
    },
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext', 'main']  // Added 'browser' field
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
      'assert',  // Added assert
      'events'   // Added events
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

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";
import path from 'path';

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
  ],
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
      'react',
      'react-dom',
      'scheduler',
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
        // Ensure React is loaded first
        entryFileNames: 'assets/[name]-[hash].js',
        // Modified chunk strategy to keep React and its exports together
        manualChunks: (id) => {
          // React and React DOM must be in a single chunk with highest priority
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }
          // Keep all other node_modules in a separate vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // Keep components together
          if (id.includes('src/components')) {
            return 'components';
          }
          // Keep pages together
          if (id.includes('src/pages')) {
            return 'pages';
          }
        },
        // Ensure react-vendor chunk is loaded first by naming convention
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'react-vendor') {
            return 'assets/react-vendor-[hash].js';
          }
          return 'assets/[name]-[hash].js';
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

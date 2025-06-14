
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";

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
      "@": fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: mode === 'development',
    rollupOptions: {
      cache: false,
      output: {
        manualChunks: undefined
      }
    },
    cssCodeSplit: true,
    minify: mode !== 'development',
    write: true,
    copyPublicDir: true
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  clearScreen: false
}));

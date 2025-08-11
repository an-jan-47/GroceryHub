// vite.config.ts
import { defineConfig } from "file:///D:/p07/Project007/node_modules/vite/dist/node/index.js";
import react from "file:///D:/p07/Project007/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { fileURLToPath, URL } from "node:url";
import { componentTagger } from "file:///D:/p07/Project007/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///D:/p07/Project007/vite.config.ts";
var vite_config_default = defineConfig(({ mode }) => ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: true,
      timeout: 12e4
    },
    watch: {
      usePolling: true,
      interval: 500
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: "util/",
      buffer: "buffer/",
      crypto: "crypto-browserify",
      http: "stream-http",
      https: "https-browserify",
      url: "url/",
      punycode: "punycode/",
      process: "process/browser",
      assert: "assert/",
      events: "events/"
    },
    mainFields: ["browser", "module", "jsnext:main", "jsnext", "main"]
  },
  optimizeDeps: {
    force: true,
    exclude: ["@capacitor/app"],
    include: [
      "react",
      "react-dom",
      "scheduler",
      "@react-pdf/renderer",
      "@react-pdf/font",
      "@react-pdf/pdfkit",
      "buffer",
      "process",
      "util",
      "stream-browserify",
      "browserify-zlib",
      "crypto-browserify",
      "stream-http",
      "https-browserify",
      "assert",
      "events"
    ],
    esbuildOptions: {
      define: {
        global: "globalThis",
        "process.env.NODE_DEBUG": "false"
      }
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: mode === "development",
    rollupOptions: {
      cache: false,
      external: ["@capacitor/app"]
    },
    cssCodeSplit: false,
    minify: true,
    target: "es2015",
    write: true,
    copyPublicDir: true,
    chunkSizeWarningLimit: 1e3,
    assetsInlineLimit: 4096
  },
  define: {
    "process.env.NODE_DEBUG": "false",
    "global": "globalThis",
    "process.env": {}
  },
  clearScreen: false
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxwMDdcXFxcUHJvamVjdDAwN1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxccDA3XFxcXFByb2plY3QwMDdcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3AwNy9Qcm9qZWN0MDA3L3ZpdGUuY29uZmlnLnRzXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gXCJub2RlOnVybFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XHJcbiAgYmFzZTogJy4vJyxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBobXI6IHtcclxuICAgICAgb3ZlcmxheTogdHJ1ZSxcclxuICAgICAgdGltZW91dDogMTIwMDAwXHJcbiAgICB9LFxyXG4gICAgd2F0Y2g6IHtcclxuICAgICAgdXNlUG9sbGluZzogdHJ1ZSxcclxuICAgICAgaW50ZXJ2YWw6IDUwMFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiYgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgIHN0cmVhbTogJ3N0cmVhbS1icm93c2VyaWZ5JyxcclxuICAgICAgemxpYjogJ2Jyb3dzZXJpZnktemxpYicsXHJcbiAgICAgIHV0aWw6ICd1dGlsLycsXHJcbiAgICAgIGJ1ZmZlcjogJ2J1ZmZlci8nLFxyXG4gICAgICBjcnlwdG86ICdjcnlwdG8tYnJvd3NlcmlmeScsXHJcbiAgICAgIGh0dHA6ICdzdHJlYW0taHR0cCcsXHJcbiAgICAgIGh0dHBzOiAnaHR0cHMtYnJvd3NlcmlmeScsXHJcbiAgICAgIHVybDogJ3VybC8nLFxyXG4gICAgICBwdW55Y29kZTogJ3B1bnljb2RlLycsXHJcbiAgICAgIHByb2Nlc3M6ICdwcm9jZXNzL2Jyb3dzZXInLFxyXG4gICAgICBhc3NlcnQ6ICdhc3NlcnQvJyxcclxuICAgICAgZXZlbnRzOiAnZXZlbnRzLydcclxuICAgIH0sXHJcbiAgICBtYWluRmllbGRzOiBbJ2Jyb3dzZXInLCAnbW9kdWxlJywgJ2pzbmV4dDptYWluJywgJ2pzbmV4dCcsICdtYWluJ11cclxuICB9LFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgZm9yY2U6IHRydWUsXHJcbiAgICBleGNsdWRlOiBbJ0BjYXBhY2l0b3IvYXBwJ10sXHJcbiAgICBpbmNsdWRlOiBbXHJcbiAgICAgICdyZWFjdCcsXHJcbiAgICAgICdyZWFjdC1kb20nLFxyXG4gICAgICAnc2NoZWR1bGVyJyxcclxuICAgICAgJ0ByZWFjdC1wZGYvcmVuZGVyZXInLFxyXG4gICAgICAnQHJlYWN0LXBkZi9mb250JyxcclxuICAgICAgJ0ByZWFjdC1wZGYvcGRma2l0JyxcclxuICAgICAgJ2J1ZmZlcicsXHJcbiAgICAgICdwcm9jZXNzJyxcclxuICAgICAgJ3V0aWwnLFxyXG4gICAgICAnc3RyZWFtLWJyb3dzZXJpZnknLFxyXG4gICAgICAnYnJvd3NlcmlmeS16bGliJyxcclxuICAgICAgJ2NyeXB0by1icm93c2VyaWZ5JyxcclxuICAgICAgJ3N0cmVhbS1odHRwJyxcclxuICAgICAgJ2h0dHBzLWJyb3dzZXJpZnknLFxyXG4gICAgICAnYXNzZXJ0JyxcclxuICAgICAgJ2V2ZW50cydcclxuICAgIF0sXHJcbiAgICBlc2J1aWxkT3B0aW9uczoge1xyXG4gICAgICBkZWZpbmU6IHtcclxuICAgICAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcclxuICAgICAgICAncHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyc6ICdmYWxzZSdcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgICBzb3VyY2VtYXA6IG1vZGUgPT09ICdkZXZlbG9wbWVudCcsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIGNhY2hlOiBmYWxzZSxcclxuICAgICAgZXh0ZXJuYWw6IFsnQGNhcGFjaXRvci9hcHAnXVxyXG4gICAgfSxcclxuICAgIGNzc0NvZGVTcGxpdDogZmFsc2UsXHJcbiAgICBtaW5pZnk6IHRydWUsXHJcbiAgICB0YXJnZXQ6ICdlczIwMTUnLFxyXG4gICAgd3JpdGU6IHRydWUsXHJcbiAgICBjb3B5UHVibGljRGlyOiB0cnVlLFxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxyXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDQwOTYsXHJcbiAgfSxcclxuICBkZWZpbmU6IHtcclxuICAgICdwcm9jZXNzLmVudi5OT0RFX0RFQlVHJzogJ2ZhbHNlJyxcclxuICAgICdnbG9iYWwnOiAnZ2xvYmFsVGhpcycsXHJcbiAgICAncHJvY2Vzcy5lbnYnOiB7fVxyXG4gIH0sXHJcbiAgY2xlYXJTY3JlZW46IGZhbHNlXHJcbn0pKTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWUsV0FBVztBQUNuQyxTQUFTLHVCQUF1QjtBQUorRyxJQUFNLDJDQUEyQztBQU1oTSxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLE1BQU07QUFBQSxFQUNOLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxNQUNULFNBQVM7QUFBQSxJQUNYO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxZQUFZO0FBQUEsTUFDWixVQUFVO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQWlCLGdCQUFnQjtBQUFBLEVBQzVDLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxNQUNwRCxRQUFRO0FBQUEsTUFDUixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsTUFDUixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsTUFDUCxLQUFLO0FBQUEsTUFDTCxVQUFVO0FBQUEsTUFDVixTQUFTO0FBQUEsTUFDVCxRQUFRO0FBQUEsTUFDUixRQUFRO0FBQUEsSUFDVjtBQUFBLElBQ0EsWUFBWSxDQUFDLFdBQVcsVUFBVSxlQUFlLFVBQVUsTUFBTTtBQUFBLEVBQ25FO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixPQUFPO0FBQUEsSUFDUCxTQUFTLENBQUMsZ0JBQWdCO0FBQUEsSUFDMUIsU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxnQkFBZ0I7QUFBQSxNQUNkLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLDBCQUEwQjtBQUFBLE1BQzVCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLGFBQWE7QUFBQSxJQUNiLFdBQVcsU0FBUztBQUFBLElBQ3BCLGVBQWU7QUFBQSxNQUNiLE9BQU87QUFBQSxNQUNQLFVBQVUsQ0FBQyxnQkFBZ0I7QUFBQSxJQUM3QjtBQUFBLElBQ0EsY0FBYztBQUFBLElBQ2QsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsT0FBTztBQUFBLElBQ1AsZUFBZTtBQUFBLElBQ2YsdUJBQXVCO0FBQUEsSUFDdkIsbUJBQW1CO0FBQUEsRUFDckI7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLDBCQUEwQjtBQUFBLElBQzFCLFVBQVU7QUFBQSxJQUNWLGVBQWUsQ0FBQztBQUFBLEVBQ2xCO0FBQUEsRUFDQSxhQUFhO0FBQ2YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 8080,
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    proxy: {
      '/api/tomorrow': {
        target: 'https://api.tomorrow.io/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tomorrow/, '')
      }
    }
  },
  define: {
    // Make sure environment variables are properly stringified
    'process.env': {}
  }
});

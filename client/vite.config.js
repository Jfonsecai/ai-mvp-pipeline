import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build output goes to ../public: Vercel serves public/** from its CDN and ignores express.static()
// (ARCHITECTURE 5.5, CR-025). public/ is generated and ignored by Git.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../public',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true, // APP_ORIGIN in .env.example assumes http://localhost:5173
    proxy: {
      // Same-origin in production; in development the Vite server forwards /api to the Express dev server.
      '/api': 'http://localhost:3000',
    },
  },
});

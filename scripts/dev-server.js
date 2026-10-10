// Local API server (development only; Vercel uses src/index.js directly).
// Start with `npm run dev:api` (loads .env if present). The Vite dev server proxies /api here.
import app from '../src/index.js';

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
  console.log(`VetCare API listening on http://localhost:${port} (health: /api/health)`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}

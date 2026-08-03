import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { app } from './src/server-app';

dotenv.config();

const PORT = 3000;

// ---------------------------------------------------------------------------
// LOCAL DEV ONLY. This file is what `npm run dev` and `npm start` use.
// On Vercel, this file is never executed — api/[...slug].ts wraps the same
// `app` from src/server-app.ts with serverless-http instead.
// ---------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use((await import('express')).default.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PromptVault Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

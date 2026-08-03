import serverless from 'serverless-http';
import { app } from '../src/server-app';

// ---------------------------------------------------------------------------
// This is the ONLY file Vercel needs for the backend. Its filename
// api/[...slug].ts makes Vercel route every /api/* request here, and
// serverless-http adapts the existing Express `app` (health, assistant/suggest,
// assistant/refactor, assistant/generate) to Vercel's serverless function
// signature with zero changes to the route logic itself.
// ---------------------------------------------------------------------------

export default serverless(app);
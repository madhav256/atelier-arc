// Boots a throwaway MongoDB replica set, seeds it, then runs the API and the Vite dev server.
// Used by Playwright's webServer locally and in CI. Nothing here touches a real database.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../backend/package.json', import.meta.url));
const { MongoMemoryReplSet } = require('mongodb-memory-server');

const db = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
const env = { ...process.env, MONGODB_URI: db.getUri('atelier_arc_e2e'), NODE_ENV: 'test', PAYMENT_PROVIDER: 'mock', EMAIL_PROVIDER: 'console', PORT: '4000', CLIENT_ORIGINS: 'http://localhost:5173' };
// Async on purpose: blocking this process would stall the in-memory mongod's log pipe.
const seedCode = await new Promise((resolve) => spawn('node', ['src/db/seed.js'], { cwd: 'backend', env, stdio: 'inherit' }).on('exit', resolve));
if (seedCode !== 0) {
  await db.stop();
  process.exit(seedCode ?? 1);
}

const children = [
  spawn('node', ['src/server.js'], { cwd: 'backend', env, stdio: 'inherit' }),
  // Test the production bundle (vite preview proxies /api like the dev server does).
  spawn('sh', ['-c', 'npx vite build --logLevel warn && npx vite preview --port 5173 --strictPort'], { cwd: 'frontend', env: process.env, stdio: 'inherit' }),
];
const stop = async () => {
  children.forEach((c) => c.kill('SIGTERM'));
  await db.stop();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
children.forEach((c) => c.on('exit', (code) => code && stop()));

import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';
import { startJobs } from './jobs/scheduler.js';

await mongoose.connect(env.mongoUri);
await mongoose.connection.syncIndexes().catch((err) => console.error('Index sync failed', err.message));
const stopJobs = process.env.JOBS_ENABLED === 'false' ? () => {} : startJobs();
const server = app.listen(env.port, () => console.log(`Atelier Arc API on :${env.port} (payments: ${env.payments.provider}, email: ${env.email.provider}, storage: ${env.storage.provider})`));

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  stopJobs();
  server.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

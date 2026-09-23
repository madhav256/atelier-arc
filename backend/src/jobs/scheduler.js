import { expireHolds } from '../services/orderService.js';
import { Inquiry } from '../models/index.js';

// In-process jobs. For multiple API instances, run them in one worker (JOBS_ENABLED=true on one instance only).
export function startJobs() {
  const timers = [];
  const run = (name, fn) => fn().catch((err) => console.error(JSON.stringify({ level: 'error', job: name, message: err.message })));
  timers.push(setInterval(() => run('expire-holds', expireHolds), 60_000));
  timers.push(
    setInterval(
      () => run('expire-offers', () => Inquiry.updateMany({ 'offer.status': 'open', 'offer.expiresAt': { $lt: new Date() } }, { 'offer.status': 'expired' })),
      10 * 60_000,
    ),
  );
  return () => timers.forEach(clearInterval);
}

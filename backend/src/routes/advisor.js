import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../lib/errors.js';
import { ok } from '../lib/util.js';
import { validate } from '../middleware/validate.js';
import { advisorLimiter } from '../middleware/rateLimits.js';
import { advise, advisorStatus } from '../services/advisorService.js';

const r = Router();
const body = z.object({
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().trim().min(1).max(1000) }))
    .min(1)
    .max(20),
});

r.get('/status', (req, res) => ok(res, advisorStatus()));
r.post('/chat', advisorLimiter, validate({ body }), asyncHandler(async (req, res) => ok(res, await advise(req.body.messages))));

export default r;

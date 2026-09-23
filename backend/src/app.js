import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import crypto from 'crypto';
import morgan from 'morgan';
import path from 'path';
import mongoose from 'mongoose';
import routes from './routes/index.js';
import webhooks from './routes/webhooks.js';
import { env } from './config/env.js';
import { notFound, errorHandler } from './lib/errors.js';
import { csrfProtection } from './middleware/csrf.js';
import { apiLimiter } from './middleware/rateLimits.js';

export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use((req, res, next) => {
  req.id = req.get('x-request-id')?.slice(0, 64) || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    strictTransportSecurity: env.isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
  }),
);
app.use(cors({ origin: (o, cb) => (!o || env.clientOrigins.includes(o) ? cb(null, true) : cb(new Error('Origin denied'))), credentials: true }));
app.use(compression());
if (!env.isTest) {
  morgan.token('id', (req) => req.id);
  app.use(morgan(env.isProd ? '{"level":"info","requestId":":id","method":":method","url":":url","status"::status,"ms"::response-time}' : 'dev'));
}

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/ready', async (req, res) => {
  const up = mongoose.connection.readyState === 1;
  res.status(up ? 200 : 503).json({ status: up ? 'ready' : 'unavailable', database: up ? 'connected' : 'disconnected' });
});
app.use('/uploads', express.static(path.resolve(env.storage.localDir), { maxAge: '365d', immutable: true, fallthrough: false }));

app.use('/api/v1', cookieParser(), webhooks);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use('/api/v1', apiLimiter, csrfProtection, routes);
app.use(notFound);
app.use(errorHandler);

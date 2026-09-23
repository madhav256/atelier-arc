import { randomToken, safeEqual } from '../lib/util.js';
import { AppError } from '../lib/errors.js';
import { env } from '../config/env.js';

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

export const csrfCookieOptions = { httpOnly: false, sameSite: 'lax', secure: env.isProd, path: '/' };

// Double-submit cookie. Required when the browser authenticates with cookies.
// Bearer-token clients and signed provider webhooks are exempt.
export function csrfProtection(req, res, next) {
  if (!req.cookies?.csrfToken) res.cookie('csrfToken', randomToken(16), csrfCookieOptions);
  if (SAFE.has(req.method)) return next();
  if (req.headers.authorization?.startsWith('Bearer ')) return next();
  if (req.path.startsWith('/webhooks/')) return next();
  const hasSessionCookie = req.cookies?.accessToken || req.cookies?.refreshToken || req.cookies?.cartSession;
  if (!hasSessionCookie) return next();
  const header = req.get('x-csrf-token');
  if (!header || !req.cookies.csrfToken || !safeEqual(header, req.cookies.csrfToken)) {
    return next(new AppError(403, 'Security token missing or invalid. Refresh and try again.', 'CSRF_FAILED'));
  }
  return next();
}

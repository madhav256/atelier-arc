import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';

function readToken(req) {
  const header = req.headers?.authorization;
  if (header?.startsWith('Bearer ')) return { token: header.slice(7), via: 'bearer' };
  if (req.cookies?.accessToken) return { token: req.cookies.accessToken, via: 'cookie' };
  return {};
}

export function authenticate(req, res, next) {
  const { token, via } = readToken(req);
  if (!token) return next(new AppError(401, 'Authentication required', 'AUTH_REQUIRED'));
  try {
    req.user = jwt.verify(token, env.accessSecret);
    req.authVia = via;
    return next();
  } catch {
    return next(new AppError(401, 'Invalid or expired token', 'INVALID_TOKEN'));
  }
}

// Attaches req.user when a valid token is present, otherwise continues as a guest.
export function optionalAuth(req, res, next) {
  const { token, via } = readToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, env.accessSecret);
      req.authVia = via;
    } catch {
      /* treat as guest */
    }
  }
  next();
}

export const authorize =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user?.role) ? next() : next(new AppError(403, 'You do not have permission', 'FORBIDDEN'));

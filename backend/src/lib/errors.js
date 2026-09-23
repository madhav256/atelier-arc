import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(status, message, code = 'ERROR', details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const notFound = (req, res, next) => next(new AppError(404, 'Resource not found', 'NOT_FOUND'));

export function errorHandler(err, req, res, _next) {
  let status = err.status || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message;
  if (err.name === 'CastError') {
    status = 400;
    code = 'INVALID_ID';
    message = 'Invalid identifier';
  } else if (err.code === 11000) {
    status = 409;
    code = 'DUPLICATE';
    message = 'A record with those details already exists';
  } else if (err.name === 'ValidationError') {
    status = 422;
    code = 'VALIDATION_ERROR';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    code = 'PAYLOAD_TOO_LARGE';
  } else if (err.message === 'Origin denied') {
    status = 403;
    code = 'ORIGIN_DENIED';
  }
  if (status >= 500 && !env.isTest) console.error(JSON.stringify({ level: 'error', requestId: req.id, message: err.message, stack: err.stack }));
  res.status(status).json({
    success: false,
    error: {
      code,
      message: status >= 500 && env.isProd ? 'Something went wrong' : message,
      details: err.details,
      requestId: req.id,
    },
  });
}

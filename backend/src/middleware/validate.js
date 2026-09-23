import { AppError } from '../lib/errors.js';

// Validates any of body/query/params with zod schemas and replaces them with the parsed output.
export const validate = (schemas) => (req, res, next) => {
  // Any bare zod schema (object, union, effects) validates the body.
  const parts = typeof schemas.safeParse === 'function' ? { body: schemas } : schemas;
  const details = {};
  for (const key of ['body', 'query', 'params']) {
    if (!parts[key]) continue;
    const out = parts[key].safeParse(req[key] ?? {});
    if (!out.success) details[key] = out.error.flatten();
    else if (key === 'query') Object.defineProperty(req, 'query', { value: out.data, writable: true, configurable: true });
    else req[key] = out.data;
  }
  if (Object.keys(details).length) return next(new AppError(422, 'Please check the highlighted fields', 'VALIDATION_ERROR', details));
  return next();
};

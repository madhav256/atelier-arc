import { AuditLog } from '../models/index.js';

const HIDDEN = new Set(['passwordHash', 'sessions', 'verificationTokenHash', 'passwordResetTokenHash']);

export function diff(before = {}, after = {}) {
  const changes = {};
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  for (const key of keys) {
    if (HIDDEN.has(key) || ['updatedAt', 'createdAt', '__v'].includes(key)) continue;
    const a = JSON.stringify(before?.[key]);
    const b = JSON.stringify(after?.[key]);
    if (a !== b) changes[key] = { from: before?.[key], to: after?.[key] };
  }
  return changes;
}

export function audit(req, { action, resource, resourceId, changes }) {
  return AuditLog.create({
    actor: req.user?.sub,
    actorEmail: req.user?.email,
    action,
    resource,
    resourceId: resourceId && String(resourceId),
    changes,
    requestId: req.id,
    ip: req.ip,
  });
}

import { Artwork, Artist, Collection, Article, Inquiry, Order, User, AuditLog } from '../models/index.js';
import { AppError } from '../lib/errors.js';
import { slugify, escapeRegex } from '../lib/util.js';
import { admin as schemas } from '../validation/schemas.js';
import { audit, diff } from './auditService.js';
import { notifyArtistFollowers, notifyAvailability } from './notificationService.js';

// Per-resource policy: model, search fields, filters, population, who may write.
export const RESOURCES = {
  artworks: { model: Artwork, search: ['title', 'medium', 'category'], filters: ['availability', 'category', 'published', 'artist', 'featured'], populate: [{ path: 'artist', select: 'name slug' }], slugFrom: 'title', write: ['admin'], read: ['admin', 'advisor'] },
  artists: { model: Artist, search: ['name', 'location', 'movement'], filters: ['published', 'featured'], slugFrom: 'name', write: ['admin'], read: ['admin', 'advisor'] },
  collections: { model: Collection, search: ['name'], filters: ['published'], slugFrom: 'name', write: ['admin'], read: ['admin', 'advisor'] },
  articles: { model: Article, search: ['title', 'author', 'type'], filters: ['published', 'type'], slugFrom: 'title', write: ['admin'], read: ['admin', 'advisor'] },
  orders: { model: Order, search: ['number', 'email'], filters: ['status'], write: [], read: ['admin', 'advisor'] },
  inquiries: { model: Inquiry, search: ['reference', 'name', 'email'], filters: ['status', 'priority', 'type', 'advisor'], populate: [{ path: 'artwork', select: 'title slug' }, { path: 'advisor', select: 'name' }], write: [], read: ['admin', 'advisor'] },
  customers: { model: User, search: ['name', 'email'], filters: ['role', 'verified', 'disabled'], write: ['admin'], read: ['admin'] },
};

export function resource(name, user, mode = 'read') {
  const config = RESOURCES[name];
  if (!config) throw new AppError(404, 'Admin resource not found', 'NOT_FOUND');
  if (!config[mode].includes(user.role)) throw new AppError(403, 'You do not have permission for this resource', 'FORBIDDEN');
  return config;
}

const SORTS = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, updated: { updatedAt: -1 }, name: { name: 1, title: 1 }, price_desc: { price: -1 }, total_desc: { total: -1 } };

export async function list(name, user, query) {
  const config = resource(name, user);
  const filter = {};
  for (const key of config.filters) {
    const value = key === 'status' ? query.status : query[key];
    if (value === undefined || value === '') continue;
    filter[key] = value === 'true' ? true : value === 'false' ? false : value;
  }
  if (name === 'inquiries' && user.role === 'advisor') filter.advisor = user.sub;
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = config.search.map((f) => ({ [f]: rx }));
  }
  const { page, limit } = query;
  let find = config.model.find(filter).sort(SORTS[query.sort] || { updatedAt: -1 }).skip((page - 1) * limit).limit(limit);
  for (const p of config.populate || []) find = find.populate(p);
  const [items, total] = await Promise.all([find.lean(), config.model.countDocuments(filter)]);
  return { items, total, page, limit };
}

export async function get(name, user, id) {
  const config = resource(name, user);
  let find = config.model.findById(id);
  for (const p of config.populate || []) find = find.populate(p);
  const item = await find.lean();
  if (!item) throw new AppError(404, 'Item not found', 'NOT_FOUND');
  return item;
}

async function uniqueSlug(model, base, excludeId) {
  let slug = slugify(base) || 'item';
  for (let i = 2; await model.exists({ slug, ...(excludeId && { _id: { $ne: excludeId } }) }); i++) slug = `${slugify(base)}-${i}`;
  return slug;
}

function parse(schema, body) {
  const out = schema.safeParse(body);
  if (!out.success) throw new AppError(422, 'Please check the highlighted fields', 'VALIDATION_ERROR', out.error.flatten());
  return out.data;
}

function normaliseArtwork(data) {
  if (data.priceOnRequest) data.price = data.price ?? null;
  if (data.dimensions && !data.orientation) {
    const { width, height } = data.dimensions;
    data.orientation = Math.abs(width - height) / Math.max(width, height) < 0.08 ? 'square' : width > height ? 'landscape' : 'portrait';
  }
  if (data.availability === 'sold') data.stock = 0;
  return data;
}

export async function create(name, req) {
  const config = resource(name, req.user, 'write');
  const schema = schemas[name]?.create;
  if (!schema) throw new AppError(405, 'Items of this type cannot be created here', 'METHOD_NOT_ALLOWED');
  let data = parse(schema, req.body);
  if (config.slugFrom) data.slug = data.slug ? await uniqueSlug(config.model, data.slug) : await uniqueSlug(config.model, data[config.slugFrom]);
  if (name === 'artworks') {
    data = normaliseArtwork(data);
    if (!(await Artist.exists({ _id: data.artist }))) throw new AppError(422, 'Choose an existing artist', 'INVALID_ARTIST');
  }
  const item = await config.model.create(data);
  await audit(req, { action: 'create', resource: name, resourceId: item._id, changes: diff({}, item.toObject()) });
  if (name === 'artworks' && item.published) {
    const artist = await Artist.findById(item.artist).lean();
    if (artist) await notifyArtistFollowers(item, artist);
  }
  return item;
}

export async function update(name, req) {
  const config = resource(name, req.user, 'write');
  const schema = schemas[name]?.update;
  if (!schema) throw new AppError(405, 'Items of this type cannot be edited here', 'METHOD_NOT_ALLOWED');
  let data = parse(schema, req.body);
  const before = await config.model.findById(req.params.id).lean();
  if (!before) throw new AppError(404, 'Item not found', 'NOT_FOUND');
  if (name === 'customers' && String(before._id) === req.user.sub && (data.role && data.role !== 'admin' || data.disabled)) {
    throw new AppError(409, 'You cannot remove your own admin access', 'SELF_LOCKOUT');
  }
  if (config.slugFrom && data.slug) data.slug = await uniqueSlug(config.model, data.slug, before._id);
  if (name === 'artworks') data = normaliseArtwork({ ...data, dimensions: data.dimensions || before.dimensions });
  const item = await config.model.findByIdAndUpdate(req.params.id, { $set: data }, { new: true, runValidators: true });
  if (name === 'customers' && (data.disabled || data.role)) await User.updateOne({ _id: item._id }, { $set: { sessions: [] } });
  await audit(req, { action: 'update', resource: name, resourceId: item._id, changes: diff(before, item.toObject()) });
  if (name === 'artworks' && before.availability !== 'available' && item.availability === 'available') await notifyAvailability(item);
  return item;
}

export async function remove(name, req) {
  const config = resource(name, req.user, 'write');
  const id = req.params.id;
  if (name === 'customers') {
    if (id === req.user.sub) throw new AppError(409, 'You cannot delete your own account here', 'SELF_LOCKOUT');
    if (await Order.exists({ user: id })) throw new AppError(409, 'Customers with orders are disabled, not deleted', 'HAS_ORDERS');
  }
  if (name === 'artists' && (await Artwork.exists({ artist: id }))) throw new AppError(409, 'Reassign or remove this artist’s works first', 'HAS_ARTWORKS');
  if (name === 'artworks' && (await Order.exists({ 'items.artwork': id }))) throw new AppError(409, 'Works with orders are unpublished, not deleted', 'HAS_ORDERS');
  const item = await config.model.findByIdAndDelete(id).lean();
  if (!item) throw new AppError(404, 'Item not found', 'NOT_FOUND');
  await audit(req, { action: 'delete', resource: name, resourceId: id, changes: diff(item, {}) });
}

export async function bulk(name, req, { ids, action }) {
  const config = resource(name, req.user, 'write');
  if (!['publish', 'unpublish', 'feature', 'unfeature'].includes(action)) throw new AppError(422, 'Unknown bulk action', 'INVALID_ACTION');
  const set = { publish: { published: true }, unpublish: { published: false }, feature: { featured: true }, unfeature: { featured: false } }[action];
  const res = await config.model.updateMany({ _id: { $in: ids } }, { $set: set });
  await audit(req, { action: `bulk:${action}`, resource: name, changes: { ids, count: res.modifiedCount } });
  return { modified: res.modifiedCount };
}

export async function auditTrail({ resource: res, resourceId, page = 1, limit = 50 }) {
  const filter = { ...(res && { resource: res }), ...(resourceId && { resourceId }) };
  const [items, total] = await Promise.all([AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), AuditLog.countDocuments(filter)]);
  return { items, total, page, limit };
}

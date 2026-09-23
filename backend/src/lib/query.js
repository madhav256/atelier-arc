import mongoose from 'mongoose';
import { escapeRegex } from './util.js';

const LIST_FIELDS = ['category', 'medium', 'availability', 'orientation', 'type'];

export function buildArtworkQuery(q = {}) {
  const filter = { published: true };
  for (const key of LIST_FIELDS) {
    if (q[key]) {
      const values = String(q[key]).split(',').filter(Boolean);
      filter[key] = values.length > 1 ? { $in: values } : values[0];
    }
  }
  if (q.artist) {
    const ids = String(q.artist).split(',').filter((id) => mongoose.isValidObjectId(id));
    if (ids.length) filter.artist = ids.length > 1 ? { $in: ids } : ids[0];
  }
  if (q.collection && mongoose.isValidObjectId(q.collection)) filter.collection = q.collection;
  if (q.tag) filter.tags = String(q.tag);
  if (q.color) filter.colors = String(q.color);
  if (q.minPrice || q.maxPrice) {
    filter.price = {
      ...(q.minPrice && { $gte: Number(q.minPrice) }),
      ...(q.maxPrice && { $lte: Number(q.maxPrice) }),
    };
  }
  if (q.minYear || q.maxYear) {
    filter.year = { ...(q.minYear && { $gte: Number(q.minYear) }), ...(q.maxYear && { $lte: Number(q.maxYear) }) };
  }
  if (q.featured === 'true') filter.featured = true;
  if (q.search) filter.$text = { $search: String(q.search).slice(0, 100) };
  return filter;
}

// Typo-tolerant fallback when $text finds nothing: match each term as a loose prefix.
export function fuzzyFilter(search) {
  const terms = String(search)
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .slice(0, 5);
  if (!terms.length) return null;
  const clauses = terms.map((term) => {
    const stem = escapeRegex(term.length > 4 ? term.slice(0, term.length - 1) : term);
    const rx = new RegExp(stem, 'i');
    return { $or: [{ title: rx }, { medium: rx }, { category: rx }, { tags: rx }] };
  });
  return { $and: clauses };
}

export const SORTS = {
  featured: { featured: -1, saveCount: -1 },
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  popular: { viewCount: -1 },
  year_desc: { year: -1 },
};

export const pageInfo = (page, limit, total) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
  hasMore: page * limit < total,
});

export function paging(q, max = 48, fallback = 12) {
  const page = Math.max(1, Number.parseInt(q.page, 10) || 1);
  const limit = Math.min(max, Math.max(1, Number.parseInt(q.limit, 10) || fallback));
  return { page, limit, skip: (page - 1) * limit };
}

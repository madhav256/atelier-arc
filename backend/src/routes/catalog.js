import { Router } from 'express';
import mongoose from 'mongoose';
import { asyncHandler, AppError } from '../lib/errors.js';
import { ok } from '../lib/util.js';
import { optionalAuth } from '../middleware/auth.js';
import { Artwork, Artist, Collection, Article } from '../models/index.js';
import { buildArtworkQuery, fuzzyFilter, SORTS, pageInfo, paging } from '../lib/query.js';
import { similarTo, trending, recordView } from '../services/recommendationService.js';
import { artworkJsonLd, sitemap } from '../services/seoService.js';
import { env } from '../config/env.js';
import { provenanceDossier, verifyCertificate } from '../services/documentService.js';

const r = Router();
const CARD = 'title slug artist images price priceOnRequest currency availability medium category year dimensions edition tags style featured orientation';

async function searchArtworks(query) {
  const { page, limit, skip } = paging(query);
  if (query.search && env.search.provider === 'atlas') {
    const compound = { must: [{ text: { query: query.search, path: ['title', 'medium', 'category', 'tags', 'description'], fuzzy: { maxEdits: 1 } } }] };
    const rest = buildArtworkQuery({ ...query, search: undefined });
    const pipeline = [{ $search: { index: env.search.atlasIndex, compound } }, { $match: rest }, { $facet: { items: [{ $skip: skip }, { $limit: limit }], total: [{ $count: 'n' }] } }];
    const [out] = await Artwork.aggregate(pipeline);
    const items = await Artwork.populate(out.items, { path: 'artist', select: 'name slug' });
    return { items, meta: pageInfo(page, limit, out.total[0]?.n || 0) };
  }
  let filter = buildArtworkQuery(query);
  const sort = query.search && !query.sort ? { score: { $meta: 'textScore' } } : SORTS[query.sort] || SORTS.newest;
  let total = await Artwork.countDocuments(filter);
  let usedFuzzy = false;
  if (!total && query.search) {
    const { $text: _text, ...rest } = filter;
    const fuzzy = fuzzyFilter(query.search);
    if (fuzzy) {
      filter = { ...rest, ...fuzzy };
      total = await Artwork.countDocuments(filter);
      usedFuzzy = true;
    }
  }
  const projection = filter.$text ? { score: { $meta: 'textScore' } } : {};
  const items = await Artwork.find(filter, projection)
    .select(CARD)
    .populate('artist', 'name slug')
    .sort(usedFuzzy && sort.score ? SORTS.newest : sort)
    .skip(skip)
    .limit(limit)
    .lean();
  return { items, meta: { ...pageInfo(page, limit, total), fuzzy: usedFuzzy } };
}

r.get('/artworks', asyncHandler(async (req, res) => {
  const { items, meta } = await searchArtworks(req.query);
  res.set('Cache-Control', 'public, max-age=60');
  ok(res, items, meta);
}));

r.get('/artworks/facets', asyncHandler(async (req, res) => {
  const match = { published: true };
  const [categories, mediums, availability, price, artists] = await Promise.all([
    Artwork.aggregate([{ $match: match }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Artwork.aggregate([{ $match: match }, { $group: { _id: '$medium', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Artwork.aggregate([{ $match: match }, { $group: { _id: '$availability', count: { $sum: 1 } } }]),
    Artwork.aggregate([{ $match: { ...match, price: { $ne: null } } }, { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }]),
    Artist.find({ published: true }).select('name slug').sort('name').lean(),
  ]);
  res.set('Cache-Control', 'public, max-age=300');
  ok(res, { categories, mediums, availability, price: price[0] || { min: 0, max: 0 }, artists });
}));

r.get('/artworks/trending', asyncHandler(async (req, res) => ok(res, await trending(Math.min(24, Number(req.query.limit) || 8)))));

r.get('/artworks/:slug', optionalAuth, asyncHandler(async (req, res) => {
  const item = await Artwork.findOne({ slug: req.params.slug, published: true }).populate('artist').populate('collection', 'name slug').lean();
  if (!item) throw new AppError(404, 'Artwork not found', 'NOT_FOUND');
  Artwork.updateOne({ _id: item._id }, { $inc: { viewCount: 1 } }).catch(() => {});
  if (req.user) recordView(req.user.sub, item._id).catch(() => {});
  const similar = await similarTo(item);
  ok(res, { ...item, similar, jsonLd: artworkJsonLd(item) });
}));

const sendPdf = (res, { filename, buffer }, disposition = 'attachment') => {
  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `${disposition}; filename="${filename}"`, 'Cache-Control': 'private, max-age=300' });
  res.send(buffer);
};

r.get('/artworks/:slug/provenance.pdf', asyncHandler(async (req, res) => sendPdf(res, await provenanceDossier(String(req.params.slug)))));

r.get('/certificates/:code', asyncHandler(async (req, res) => ok(res, await verifyCertificate(String(req.params.code).slice(0, 64)))));

r.get('/artists', asyncHandler(async (req, res) => {
  const filter = { published: true };
  if (req.query.featured === 'true') filter.featured = true;
  const artists = await Artist.find(filter).sort({ featured: -1, name: 1 }).lean();
  const counts = await Artwork.aggregate([{ $match: { published: true } }, { $group: { _id: '$artist', works: { $sum: 1 }, available: { $sum: { $cond: [{ $eq: ['$availability', 'available'] }, 1, 0] } } } }]);
  const map = new Map(counts.map((c) => [String(c._id), c]));
  ok(res, artists.map((a) => ({ ...a, works: map.get(String(a._id))?.works || 0, available: map.get(String(a._id))?.available || 0 })));
}));

r.get('/artists/:slug', asyncHandler(async (req, res) => {
  const artist = await Artist.findOne({ slug: req.params.slug, published: true }).lean();
  if (!artist) throw new AppError(404, 'Artist not found', 'NOT_FOUND');
  const [artworks, articles] = await Promise.all([
    Artwork.find({ artist: artist._id, published: true }).select(CARD).populate('artist', 'name slug').sort({ availability: 1, year: -1 }).lean(),
    Article.find({ relatedArtists: artist._id, published: true }).select('title slug coverImage type publishedAt').lean(),
  ]);
  ok(res, { ...artist, artworks, articles });
}));

r.get('/collections', asyncHandler(async (req, res) => ok(res, await Collection.find({ published: true }).sort('order').lean())));
r.get('/collections/:slug', asyncHandler(async (req, res) => {
  const collection = await Collection.findOne({ slug: req.params.slug, published: true }).lean();
  if (!collection) throw new AppError(404, 'Collection not found', 'NOT_FOUND');
  const artworks = await Artwork.find({ published: true, $or: [{ collection: collection._id }, { _id: { $in: collection.artworks || [] } }] }).select(CARD).populate('artist', 'name slug').lean();
  ok(res, { ...collection, artworks });
}));

r.get('/articles', asyncHandler(async (req, res) => {
  const { page, limit, skip } = paging(req.query, 24, 12);
  const filter = { published: true, ...(req.query.type && { type: String(req.query.type) }) };
  const [items, total] = await Promise.all([Article.find(filter).select('-content').sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(), Article.countDocuments(filter)]);
  ok(res, items, pageInfo(page, limit, total));
}));
r.get('/articles/:slug', asyncHandler(async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug, published: true })
    .populate({ path: 'relatedArtworks', select: CARD, populate: { path: 'artist', select: 'name slug' } })
    .populate('relatedArtists', 'name slug portrait')
    .lean();
  if (!article) throw new AppError(404, 'Story not found', 'NOT_FOUND');
  ok(res, article);
}));

r.get('/seo/sitemap.xml', asyncHandler(async (req, res) => {
  res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(await sitemap());
}));

r.get('/lookup/artworks', asyncHandler(async (req, res) => {
  const ids = String(req.query.ids || '').split(',').filter((id) => mongoose.isValidObjectId(id)).slice(0, 50);
  ok(res, await Artwork.find({ _id: { $in: ids }, published: true }).select(CARD).populate('artist', 'name slug').lean());
}));

export default r;

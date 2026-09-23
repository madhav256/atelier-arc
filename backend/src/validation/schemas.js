import { z } from 'zod';
import mongoose from 'mongoose';

export const objectId = z.string().refine((v) => mongoose.isValidObjectId(v), 'Invalid id');
const text = (max = 200) => z.string().trim().max(max);
const url = z.string().trim().url().max(1000);
// Images may be absolute URLs or root-relative paths to assets served with the storefront (e.g. /art/work-01.jpg).
const assetUrl = z.string().trim().max(1000).refine((v) => /^https?:\/\//.test(v) || /^\/[^/]/.test(v), 'Must be a URL or a root-relative path');
const email = z.string().trim().toLowerCase().email().max(200);
export const password = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(128)
  .refine((v) => /[a-z]/i.test(v) && /\d/.test(v), 'Include letters and at least one number');

export const idParam = z.object({ id: objectId });

export const address = z.object({
  name: text(120),
  line1: text(200),
  line2: text(200).optional().or(z.literal('')),
  city: text(100),
  state: text(100).optional().or(z.literal('')),
  postalCode: text(20),
  country: z.string().trim().toUpperCase().length(2),
  phone: text(30).optional().or(z.literal('')),
});

export const auth = {
  register: z.object({ name: text(120).min(2), email, password }),
  login: z.object({ email, password: z.string().min(1).max(128) }),
  email: z.object({ email }),
  reset: z.object({ token: z.string().min(20).max(200), password }),
  verify: z.object({ token: z.string().min(20).max(200) }),
  change: z.object({ currentPassword: z.string().min(1).max(128), newPassword: password }),
};

export const profile = z.object({
  name: text(120).min(2).optional(),
  phone: text(30).optional(),
  preferences: z
    .object({
      categories: z.array(text(60)).max(20).optional(),
      mediums: z.array(text(60)).max(20).optional(),
      artists: z.array(objectId).max(50).optional(),
      priceMin: z.number().min(0).optional(),
      priceMax: z.number().min(0).optional(),
    })
    .optional(),
  notificationSettings: z.record(z.boolean()).optional(),
  addresses: z.array(address.extend({ label: text(40).optional() })).max(10).optional(),
});

export const cart = {
  add: z.object({ artworkId: objectId, quantity: z.number().int().min(1).max(20).default(1) }),
  update: z.object({ quantity: z.number().int().min(1).max(20) }),
};

export const checkout = {
  quote: z.object({ address, deliveryMethod: z.enum(['insured_courier', 'white_glove', 'collect']) }),
  order: z.object({
    email,
    address,
    billingAddress: address.optional(),
    deliveryMethod: z.enum(['insured_courier', 'white_glove', 'collect']),
    quoteToken: z.string().min(20).max(4000),
    idempotencyKey: z.string().min(8).max(100).optional(),
  }),
  offer: z.object({ email, address, deliveryMethod: z.enum(['insured_courier', 'white_glove', 'collect']) }),
};

export const inquiry = {
  create: z.object({
    artwork: objectId.optional(),
    type: z.enum(['artwork', 'advisory', 'commission', 'viewing', 'general']).optional(),
    name: text(120).min(2),
    email,
    phone: text(30).optional().or(z.literal('')),
    message: text(4000).min(10, 'Tell us a little more (at least 10 characters)'),
    preferredContact: z.enum(['email', 'phone', 'whatsapp']).default('email'),
    preferredViewingDate: z.coerce.date().optional(),
    budgetRange: text(60).optional(),
    website: z.string().max(0).optional(), // honeypot: must stay empty
  }),
  message: z.object({ text: text(4000).min(1) }),
  status: z.object({ status: z.enum(['new', 'contacted', 'viewing_scheduled', 'negotiation', 'acquired', 'closed']) }),
  assign: z.object({ advisorId: objectId }),
  appointment: z.object({ startsAt: z.coerce.date(), mode: z.enum(['gallery', 'virtual', 'private']), location: text(200).optional() }),
  appointmentResponse: z.object({ status: z.enum(['confirmed', 'cancelled']) }),
  offer: z.object({ amount: z.number().positive().max(1e10), expiresInDays: z.number().int().min(1).max(30).default(7) }),
};

export const collection = {
  create: z.object({ name: text(80).min(1), description: text(500).optional(), isPublic: z.boolean().optional() }),
  update: z.object({ name: text(80).min(1).optional(), description: text(500).optional(), isPublic: z.boolean().optional() }),
  item: z.object({ artworkId: objectId, note: text(500).optional() }),
  note: z.object({ note: text(500) }),
};

const image = z.object({ url: assetUrl, alt: text(300).default(''), width: z.number().int().positive().optional(), height: z.number().int().positive().optional(), variants: z.array(z.object({ url: assetUrl, width: z.number(), format: z.string() })).optional() });

const artwork = z.object({
  title: text(200).min(1),
  slug: text(100).regex(/^[a-z0-9-]+$/).optional(),
  artist: objectId,
  category: text(60),
  medium: text(120),
  dimensions: z.object({ width: z.number().positive(), height: z.number().positive(), depth: z.number().min(0).optional(), unit: z.enum(['cm', 'in']).default('cm') }),
  year: z.number().int().min(1800).max(2100).optional(),
  edition: text(80).optional().nullable(),
  stock: z.number().int().min(0).max(1000).default(1),
  price: z.number().min(0).max(1e10).optional().nullable(),
  currency: z.string().length(3).default('INR'),
  priceOnRequest: z.boolean().default(false),
  availability: z.enum(['available', 'reserved', 'sold']).default('available'),
  description: text(5000).optional(),
  provenance: z.array(text(300)).max(30).optional(),
  exhibitionHistory: z.array(text(300)).max(30).optional(),
  condition: text(300).optional(),
  certificate: text(300).optional(),
  shipping: text(500).optional(),
  images: z.array(image).max(20).default([]),
  collection: objectId.optional().nullable(),
  tags: z.array(text(40)).max(30).optional(),
  style: z.array(text(40)).max(20).optional(),
  colors: z.array(text(20)).max(10).optional(),
  orientation: z.enum(['portrait', 'landscape', 'square']).optional(),
  type: text(40).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().default(true),
});

const artist = z.object({
  name: text(120).min(2),
  slug: text(100).regex(/^[a-z0-9-]+$/).optional(),
  portrait: assetUrl.optional().or(z.literal('')),
  biography: text(8000).optional(),
  statement: text(4000).optional(),
  nationality: text(80).optional(),
  location: text(120).optional(),
  birthYear: z.number().int().min(1850).max(2020).optional(),
  movement: text(120).optional(),
  timeline: z.array(z.object({ year: z.number().int(), title: text(200), description: text(1000).optional() })).max(60).optional(),
  exhibitions: z.array(text(300)).max(100).optional(),
  awards: z.array(text(300)).max(50).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().default(true),
});

const curated = z.object({
  name: text(120).min(2),
  slug: text(100).regex(/^[a-z0-9-]+$/).optional(),
  description: text(2000).optional(),
  coverImage: assetUrl.optional().or(z.literal('')),
  artworks: z.array(objectId).max(200).optional(),
  order: z.number().int().optional(),
  published: z.boolean().default(true),
});

const article = z.object({
  title: text(200).min(2),
  slug: text(100).regex(/^[a-z0-9-]+$/).optional(),
  subtitle: text(300).optional(),
  coverImage: assetUrl.optional().or(z.literal('')),
  author: text(120).optional(),
  publishedAt: z.coerce.date().optional(),
  readingTime: z.number().int().min(1).max(120).optional(),
  type: text(60).optional(),
  tags: z.array(text(40)).max(20).optional(),
  content: text(100000).optional(),
  relatedArtworks: z.array(objectId).max(20).optional(),
  relatedArtists: z.array(objectId).max(20).optional(),
  published: z.boolean().default(true),
});

const customer = z.object({
  name: text(120).min(2).optional(),
  role: z.enum(['customer', 'advisor', 'admin']).optional(),
  verified: z.boolean().optional(),
  disabled: z.boolean().optional(),
});

export const admin = {
  artworks: { create: artwork, update: artwork.partial() },
  artists: { create: artist, update: artist.partial() },
  collections: { create: curated, update: curated.partial() },
  articles: { create: article, update: article.partial() },
  customers: { create: null, update: customer },
  orderStatus: z.object({
    status: z.enum(['preparing', 'shipped', 'delivered', 'cancelled']),
    note: text(500).optional(),
    tracking: z.object({ carrier: text(80), number: text(80), url: url.optional() }).optional(),
  }),
  refund: z.object({ note: text(500).optional() }),
};

export const listQuery = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    q: z.string().max(100).optional(),
    status: z.string().max(40).optional(),
    sort: z.string().max(40).optional(),
  })
  .passthrough();

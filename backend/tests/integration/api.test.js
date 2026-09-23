import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { startDb, stopDb, resetDb, makeUser, agentFor, makeArtwork, address } from './setup.js';
import { outbox } from '../../src/providers/email/index.js';
import { Artwork, Order, AuditLog, Notification, InventoryHold, Inquiry, PaymentEvent } from '../../src/models/index.js';
import { mockProvider } from '../../src/providers/payments/mock.js';
import { expireHolds } from '../../src/services/orderService.js';

beforeAll(startDb, 120_000);
afterAll(stopDb);
beforeEach(async () => {
  await resetDb();
  outbox.length = 0;
});

async function checkoutAs(client, artwork) {
  await client.post('/api/v1/cart/items').send({ artworkId: String(artwork._id) }).expect(200);
  const quote = await client.post('/api/v1/checkout/quote').send({ address, deliveryMethod: 'insured_courier' }).expect(200);
  const order = await client.post('/api/v1/checkout/orders').send({ email: 'buyer@example.com', address, deliveryMethod: 'insured_courier', quoteToken: quote.body.data.quoteToken, idempotencyKey: `key-${Math.random()}` });
  return { quote: quote.body.data, order };
}

describe('auth', () => {
  it('registers, emails a verification link, verifies and rotates refresh tokens', async () => {
    const c = await agentFor();
    const reg = await c.post('/api/v1/auth/register').send({ name: 'Asha Rao', email: 'asha@example.com', password: 'Collector2026' }).expect(201);
    expect(reg.body.data.user.passwordHash).toBeUndefined();
    const mail = outbox.find((m) => m.to === 'asha@example.com');
    const token = /token=([a-f0-9]+)/.exec(mail.text)[1];
    const verified = await c.post('/api/v1/auth/verify-email').send({ token }).expect(200);
    expect(verified.body.data.user.verified).toBe(true);
    const cookie = reg.headers['set-cookie'].find((x) => x.startsWith('refreshToken='));
    const raw = /refreshToken=([^;]+)/.exec(cookie)[1];
    await c.post('/api/v1/auth/refresh').expect(200);
    // Replaying the old refresh token is detected and revokes all sessions.
    const replay = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: raw });
    expect(replay.body.error.code).toBe('REFRESH_REUSE');
  });

  it('rejects cookie-authenticated writes without a CSRF token', async () => {
    const creds = await makeUser();
    const c = await agentFor(creds);
    const res = await c.agent.post('/api/v1/me/collections').send({ name: 'Study' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_FAILED');
    await c.post('/api/v1/me/collections').send({ name: 'Study' }).expect(201);
  });

  it('does not reveal whether an account exists on password reset', async () => {
    const creds = await makeUser();
    const c = await agentFor();
    const a = await c.post('/api/v1/auth/forgot-password').send({ email: creds.email }).expect(200);
    const b = await c.post('/api/v1/auth/forgot-password').send({ email: 'nobody@example.com' }).expect(200);
    expect(a.body.data).toEqual(b.body.data);
    const token = /token=([a-f0-9]+)/.exec(outbox.at(-1).text)[1];
    await c.post('/api/v1/auth/reset-password').send({ token, password: 'NewPassword99' }).expect(200);
    await c.post('/api/v1/auth/reset-password').send({ token, password: 'NewPassword99' }).expect(400);
  });

  it('validates input with field details', async () => {
    const c = await agentFor();
    const res = await c.post('/api/v1/auth/register').send({ email: 'bad', password: 'short' }).expect(422);
    expect(res.body.error.details.body.fieldErrors.email).toBeTruthy();
  });
});

describe('catalog', () => {
  it('filters, paginates and falls back to fuzzy search', async () => {
    await makeArtwork({ title: 'Monsoon Study' });
    await makeArtwork({ title: 'Stone Memory', category: 'Sculptures' });
    const list = await request(app).get('/api/v1/artworks?category=Sculptures').expect(200);
    expect(list.body.data).toHaveLength(1);
    const fuzzy = await request(app).get('/api/v1/artworks?search=monsoo').expect(200);
    expect(fuzzy.body.data[0].title).toBe('Monsoon Study');
  });

  it('returns artwork detail with JSON-LD and similar works', async () => {
    const a = await makeArtwork();
    const res = await request(app).get(`/api/v1/artworks/${a.slug}`).expect(200);
    expect(res.body.data.jsonLd['@type']).toContain('VisualArtwork');
    expect(res.body.data.jsonLd.offers.price).toBe(100000);
  });

  it('generates a sitemap from live records', async () => {
    const a = await makeArtwork();
    const res = await request(app).get('/api/v1/seo/sitemap.xml').expect(200);
    expect(res.text).toContain(`/artworks/${a.slug}`);
  });
});

describe('checkout and payments', () => {
  it('prices on the server, reserves stock and confirms only via signed webhook', async () => {
    const art = await makeArtwork({ price: 200000 });
    const c = await agentFor();
    const { quote, order } = await checkoutAs(c, art);
    expect(quote.tax).toBe(24000);
    expect(order.status).toBe(201);
    const { order: o, payment } = order.body.data;
    expect(o.status).toBe('pending_payment');
    expect((await Artwork.findById(art._id)).availability).toBe('reserved');
    const bad = await request(app).post('/api/v1/webhooks/mock').set('content-type', 'application/json').set('x-mock-signature', 'nope').send(JSON.stringify({ id: 'evt_1', type: 'payment.succeeded', intentId: o.payment.intentId }));
    expect(bad.status).toBe(400);
    const body = JSON.stringify({ id: 'evt_2', type: 'payment.succeeded', intentId: o.payment.intentId });
    const good = await request(app).post('/api/v1/webhooks/mock').set('content-type', 'application/json').set('x-mock-signature', mockProvider.sign(body)).send(body).expect(200);
    expect(good.body.received).toBe(true);
    const dup = await request(app).post('/api/v1/webhooks/mock').set('content-type', 'application/json').set('x-mock-signature', mockProvider.sign(body)).send(body).expect(200);
    expect(dup.body.duplicate).toBe(true);
    expect((await Order.findById(o._id)).status).toBe('confirmed');
    expect((await Artwork.findById(art._id)).availability).toBe('sold');
    expect(await PaymentEvent.countDocuments()).toBe(1);
    expect(payment.provider).toBe('mock');
    expect(outbox.some((m) => m.subject.startsWith('Acquisition confirmed'))).toBe(true);
  });

  it('prevents two collectors from buying the same original', async () => {
    const art = await makeArtwork();
    const a = await agentFor();
    const b = await agentFor();
    await b.post('/api/v1/cart/items').send({ artworkId: String(art._id) }).expect(200);
    const quoteB = await b.post('/api/v1/checkout/quote').send({ address, deliveryMethod: 'insured_courier' }).expect(200);
    const first = await checkoutAs(a, art);
    expect(first.order.status).toBe(201);
    const second = await b.post('/api/v1/checkout/orders').send({ email: 'b@example.com', address, deliveryMethod: 'insured_courier', quoteToken: quoteB.body.data.quoteToken });
    expect(second.status).toBe(409);
  });

  it('rejects a tampered quote and replays idempotent orders', async () => {
    const art = await makeArtwork();
    const c = await agentFor();
    await c.post('/api/v1/cart/items').send({ artworkId: String(art._id) }).expect(200);
    const q = (await c.post('/api/v1/checkout/quote').send({ address, deliveryMethod: 'insured_courier' })).body.data;
    const tampered = await c.post('/api/v1/checkout/orders').send({ email: 'x@example.com', address, deliveryMethod: 'insured_courier', quoteToken: `${q.quoteToken}x` });
    expect(tampered.status).toBe(400);
    const input = { email: 'x@example.com', address, deliveryMethod: 'insured_courier', quoteToken: q.quoteToken, idempotencyKey: 'order-attempt-1' };
    const one = await c.post('/api/v1/checkout/orders').send(input).expect(201);
    const two = await c.post('/api/v1/checkout/orders').send(input).expect(201);
    expect(two.body.data.order._id).toBe(one.body.data.order._id);
    expect(await Order.countDocuments()).toBe(1);
  });

  it('releases expired holds and alerts waiting collectors', async () => {
    const art = await makeArtwork();
    const waiter = await makeUser();
    const w = await agentFor(waiter);
    const c = await agentFor();
    await checkoutAs(c, art);
    await w.post('/api/v1/me/alerts').send({ artworkId: String(art._id) }).expect(201);
    await InventoryHold.updateMany({}, { expiresAt: new Date(Date.now() - 1000) });
    expect(await expireHolds()).toBe(1);
    expect((await Artwork.findById(art._id)).availability).toBe('available');
    expect(await Notification.countDocuments({ user: waiter.user._id, type: 'availability' })).toBe(1);
  });

  it('refuses price-on-request works in the cart', async () => {
    const art = await makeArtwork({ price: null, priceOnRequest: true });
    const c = await agentFor();
    const res = await c.post('/api/v1/cart/items').send({ artworkId: String(art._id) });
    expect(res.body.error.code).toBe('PRICE_ON_REQUEST');
  });
});

describe('inquiries and advisory', () => {
  it('assigns an advisor, keeps notes private and converts an offer to an order', async () => {
    const advisor = await makeUser('advisor');
    const client = await makeUser();
    const art = await makeArtwork({ price: null, priceOnRequest: true });
    const c = await agentFor(client);
    const created = await c.post('/api/v1/inquiries').send({ artwork: String(art._id), name: 'Client One', email: client.email, message: 'I would love to see this in person.' }).expect(201);
    expect(created.body.data.reference).toMatch(/^INQ-/);
    const inquiry = await Inquiry.findOne();
    expect(String(inquiry.advisor)).toBe(String(advisor.user._id));
    const s = await agentFor(advisor);
    await s.post(`/api/v1/admin/inquiries/${inquiry._id}/notes`).send({ text: 'Serious buyer, flexible on timing' }).expect(200);
    await s.post(`/api/v1/admin/inquiries/${inquiry._id}/messages`).send({ text: 'Happy to arrange a viewing.' }).expect(200);
    await s.post(`/api/v1/admin/inquiries/${inquiry._id}/offer`).send({ amount: 450000 }).expect(200);
    const view = await c.get(`/api/v1/me/inquiries/${inquiry._id}`).expect(200);
    expect(view.body.data.notes).toBeUndefined();
    expect(view.body.data.messages).toHaveLength(2);
    const accepted = await c.post(`/api/v1/me/inquiries/${inquiry._id}/offer/accept`).send({ email: client.email, address, deliveryMethod: 'collect' }).expect(201);
    expect(accepted.body.data.order.subtotal).toBe(450000);
    expect(await AuditLog.countDocuments({ resource: 'inquiries' })).toBe(3);
  });

  it('stops advisors from reading other advisors’ inquiries', async () => {
    const a1 = await makeUser('advisor');
    const a2 = await makeUser('advisor');
    const inquiry = await Inquiry.create({ reference: 'INQ-X', name: 'N', email: 'n@example.com', message: 'hello there', advisor: a1.user._id });
    const s2 = await agentFor(a2);
    await s2.get(`/api/v1/admin/inquiries/${inquiry._id}`).expect(404);
  });

  it('rejects honeypot submissions', async () => {
    const c = await agentFor();
    await c.post('/api/v1/inquiries').send({ name: 'Bot', email: 'b@example.com', message: 'Buy cheap things now', website: 'spam' }).expect(422);
  });
});

describe('admin', () => {
  it('enforces roles, validates, slugs and writes an immutable audit trail', async () => {
    const adminUser = await makeUser('admin');
    const customer = await makeUser();
    const cu = await agentFor(customer);
    await cu.get('/api/v1/admin/artworks').expect(403);
    const a = await agentFor(adminUser);
    const artist = await a.post('/api/v1/admin/artists').send({ name: 'Leela Iyer' }).expect(201);
    expect(artist.body.data.slug).toBe('leela-iyer');
    await a.post('/api/v1/admin/artworks').send({ title: 'x' }).expect(422);
    const art = await a.post('/api/v1/admin/artworks').send({ title: 'Blue Interval', artist: artist.body.data._id, category: 'Paintings', medium: 'Oil', dimensions: { width: 100, height: 60 }, price: 90000 }).expect(201);
    expect(art.body.data.orientation).toBe('landscape');
    await a.patch(`/api/v1/admin/artworks/${art.body.data._id}`).send({ price: 95000 }).expect(200);
    const trail = await a.get(`/api/v1/admin/audit?resourceId=${art.body.data._id}`).expect(200);
    expect(trail.body.data[0].changes.price).toEqual({ from: 90000, to: 95000 });
    await expect(AuditLog.deleteMany({})).rejects.toThrow(/immutable/);
    await a.delete(`/api/v1/admin/artists/${artist.body.data._id}`).expect(409);
  });

  it('protects admins from locking themselves out', async () => {
    const adminUser = await makeUser('admin');
    const a = await agentFor(adminUser);
    await a.patch(`/api/v1/admin/customers/${adminUser.user._id}`).send({ role: 'customer' }).expect(409);
  });
});

describe('collections, notifications and recommendations', () => {
  it('saves works, shares a collection publicly and recommends related works', async () => {
    const creds = await makeUser();
    const c = await agentFor(creds);
    const base = await makeArtwork({ tags: ['abstract', 'blue'] });
    const artistDoc = { _id: base.artist };
    for (let i = 0; i < 3; i++) await makeArtwork({ artistDoc, title: `Series ${i}` });
    await makeArtwork({ category: 'Photography', medium: 'Print', tags: [] });
    const lists = await c.get('/api/v1/me/collections').expect(200);
    const id = lists.body.data[0]._id;
    await c.post(`/api/v1/me/collections/${id}/items`).send({ artworkId: String(base._id), note: 'For the study' }).expect(201);
    const shared = await c.patch(`/api/v1/me/collections/${id}`).send({ isPublic: true }).expect(200);
    await request(app).get(`/api/v1/shared/collections/${shared.body.data.shareToken}`).expect(200);
    const recs = await c.get('/api/v1/me/recommendations').expect(200);
    expect(recs.body.meta.reason).toBe('personal');
    expect(recs.body.data[0].title).toMatch(/Series/);
    expect((await Artwork.findById(base._id)).saveCount).toBe(1);
  });

  it('lists, counts and marks notifications read', async () => {
    const creds = await makeUser();
    await Notification.create([{ user: creds.user._id, type: 'system', title: 'A' }, { user: creds.user._id, type: 'system', title: 'B' }]);
    const c = await agentFor(creds);
    const list = await c.get('/api/v1/me/notifications').expect(200);
    expect(list.body.meta.unread).toBe(2);
    await c.post('/api/v1/me/notifications/read-all').expect(200);
    expect((await c.get('/api/v1/me/notifications/unread-count')).body.data.unread).toBe(0);
  });
});

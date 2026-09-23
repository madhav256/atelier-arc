import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { app } from '../../src/app.js';
import { Artist, Artwork, User } from '../../src/models/index.js';

let replset;
export async function startDb() {
  replset = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  await mongoose.connect(replset.getUri());
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
}
export async function stopDb() {
  await mongoose.disconnect();
  await replset?.stop();
}
export async function resetDb() {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
}

export async function makeUser(role = 'customer', email = `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`) {
  const user = await User.create({ name: `${role} user`, email, role, verified: true, passwordHash: await bcrypt.hash('Password123', 4) });
  return { user, email, password: 'Password123' };
}

// Signs in and returns a supertest agent that carries cookies and the CSRF header.
export async function agentFor(creds) {
  const agent = request.agent(app);
  const first = await agent.get('/api/v1/auth/csrf');
  let csrf = /csrfToken=([^;]+)/.exec(first.headers['set-cookie']?.join(';') || '')?.[1];
  if (creds) await agent.post('/api/v1/auth/login').set('x-csrf-token', csrf).send({ email: creds.email, password: creds.password }).expect(200);
  const wrap = (method) => (url) => agent[method](url).set('x-csrf-token', csrf);
  return { agent, csrf, get: (u) => agent.get(u), post: wrap('post'), patch: wrap('patch'), put: wrap('put'), delete: wrap('delete') };
}

export async function makeArtwork(overrides = {}) {
  const artist = overrides.artistDoc || (await Artist.create({ name: `Artist ${Math.random()}`, slug: `artist-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }));
  return Artwork.create({
    title: 'Quiet Geometry',
    slug: `quiet-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    artist: artist._id,
    category: 'Paintings',
    medium: 'Oil on linen',
    price: 100000,
    stock: 1,
    tags: ['abstract'],
    dimensions: { width: 80, height: 100, unit: 'cm' },
    ...overrides,
    artistDoc: undefined,
  });
}

export const address = { name: 'Asha Rao', line1: '12 Marine Drive', city: 'Mumbai', state: 'MH', postalCode: '400020', country: 'IN' };

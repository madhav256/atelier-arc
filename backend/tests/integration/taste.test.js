import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startDb, stopDb, resetDb, makeUser, agentFor, makeArtwork } from './setup.js';
import { User } from '../../src/models/index.js';

beforeAll(startDb, 120_000);
afterAll(stopDb);
beforeEach(resetDb);

describe('taste quiz', () => {
  it('stores stated taste without erasing other preferences, and tunes recommendations', async () => {
    const creds = await makeUser();
    const c = await agentFor(creds);
    await c.patch('/api/v1/me/profile').send({ preferences: { categories: ['Paintings'] } }).expect(200);
    const arch = await makeArtwork({ title: 'Arch', style: ['arch', 'minimal'], tags: ['cool'], dimensions: { width: 50, height: 60, unit: 'cm' } });
    await makeArtwork({ title: 'Field', style: ['colour-field', 'gestural'], tags: ['warm'], dimensions: { width: 120, height: 150, unit: 'cm' } });

    await c.put('/api/v1/me/taste').send({ action: 'complete', styles: ['bogus'] }).expect(422);
    const res = await c.put('/api/v1/me/taste').send({ action: 'complete', styles: ['arch'], palettes: ['cool'], scale: 'intimate', priceMax: 500000 }).expect(200);
    expect(res.body.data.preferences).toMatchObject({ styles: ['arch'], palettes: ['cool'], scale: 'intimate', priceMax: 500000, categories: ['Paintings'] });
    expect(res.body.data.tasteQuiz.completedAt).toBeTruthy();

    const recs = await c.get('/api/v1/me/recommendations?limit=2').expect(200);
    expect(recs.body.data.reason ?? recs.body.meta?.reason ?? 'personal').toBe('personal');
    const items = recs.body.data.items || recs.body.data;
    expect(String(items[0]._id)).toBe(String(arch._id));
  });

  it('records a skip', async () => {
    const creds = await makeUser();
    const c = await agentFor(creds);
    await c.put('/api/v1/me/taste').send({ action: 'skip' }).expect(200);
    const user = await User.findOne({ email: creds.email }).lean();
    expect(user.tasteQuiz.skippedAt).toBeInstanceOf(Date);
    expect(user.tasteQuiz.completedAt).toBeUndefined();
  });
});

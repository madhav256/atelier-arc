import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { startDb, stopDb, resetDb, makeUser, agentFor, makeArtwork } from './setup.js';

beforeAll(startDb, 120_000);
afterAll(stopDb);
beforeEach(resetDb);

const here = path.dirname(fileURLToPath(import.meta.url));
const FILM = path.resolve(here, '../../../frontend/public/film/work-04.mp4');

describe('artwork film', () => {
  it('uploads an MP4, rejects other files, and saves the film on the work', async () => {
    const admin = await agentFor(await makeUser('admin'));
    const film = await fs.readFile(FILM);
    const up = await admin.post('/api/v1/admin/uploads/video').attach('video', film, 'studio.mp4').field('caption', 'Studio walk-round').expect(201);
    expect(up.body.data).toMatchObject({ mime: 'video/mp4', caption: 'Studio walk-round' });
    expect(up.body.data.url).toMatch(/\/uploads\/films\/.+\.mp4$/);

    const png = await sharp({ create: { width: 500, height: 500, channels: 3, background: '#888' } }).png().toBuffer();
    expect((await admin.post('/api/v1/admin/uploads/video').attach('video', png, 'x.mp4').expect(415)).body.error.code).toBe('UNSUPPORTED_MEDIA');
    await admin.post('/api/v1/admin/uploads/video').expect(422);

    const art = await makeArtwork();
    await admin.patch(`/api/v1/admin/artworks/${art._id}`).send({ video: { url: up.body.data.url, mime: 'video/mp4', caption: 'Studio walk-round' } }).expect(200);
    const pub = await admin.get(`/api/v1/artworks/${art.slug}`).expect(200);
    expect(pub.body.data.video).toMatchObject({ url: up.body.data.url, mime: 'video/mp4' });
  });

  it('only admins can upload films', async () => {
    const advisor = await agentFor(await makeUser('advisor'));
    await advisor.post('/api/v1/admin/uploads/video').attach('video', Buffer.from('x'), 'a.mp4').expect(403);
  });
});

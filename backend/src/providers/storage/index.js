import fs from 'fs/promises';
import path from 'path';
import net from 'net';
import crypto from 'crypto';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import { env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_PIXELS = 60_000_000;
const WIDTHS = [480, 960, 1600];

// Optional ClamAV scan (free, self-hosted). Enabled when CLAMAV_HOST is set.
export function clamScan(buffer, { host = env.storage.clamavHost, port = env.storage.clamavPort } = {}) {
  if (!host) return Promise.resolve({ skipped: true });
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(port, host, () => {
      socket.write('zINSTREAM\0');
      for (let i = 0; i < buffer.length; i += 64 * 1024) {
        const chunk = buffer.subarray(i, i + 64 * 1024);
        const size = Buffer.alloc(4);
        size.writeUInt32BE(chunk.length);
        socket.write(size);
        socket.write(chunk);
      }
      socket.write(Buffer.alloc(4));
    });
    let reply = '';
    socket.setTimeout(15_000, () => socket.destroy(new Error('ClamAV timeout')));
    socket.on('data', (d) => (reply += d.toString()));
    socket.on('end', () => (reply.includes('FOUND') ? reject(new AppError(422, 'The file failed the malware scan', 'MALWARE_DETECTED')) : resolve({ clean: true })));
    socket.on('error', reject);
  });
}

// Sniffs real type, enforces limits, strips EXIF/GPS, and builds WebP/AVIF derivatives.
export async function processImage(buffer) {
  const type = await fileTypeFromBuffer(buffer);
  if (!type || !ALLOWED.has(type.mime)) throw new AppError(415, 'Upload a JPEG, PNG, WebP or AVIF image', 'UNSUPPORTED_MEDIA');
  const meta = await sharp(buffer, { limitInputPixels: MAX_PIXELS }).metadata();
  if (!meta.width || !meta.height) throw new AppError(422, 'The image could not be read', 'INVALID_IMAGE');
  if (meta.width < 400 || meta.height < 400) throw new AppError(422, 'Images must be at least 400px on each side', 'IMAGE_TOO_SMALL');
  await clamScan(buffer);
  const base = sharp(buffer, { limitInputPixels: MAX_PIXELS }).rotate(); // rotate applies EXIF orientation; metadata is dropped on output
  const master = await base.clone().resize({ width: 2400, withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  const variants = [];
  for (const width of WIDTHS.filter((w) => w < meta.width || w === WIDTHS[0])) {
    for (const format of ['webp', 'avif']) {
      const out = await base.clone().resize({ width, withoutEnlargement: true })[format]({ quality: format === 'avif' ? 55 : 78 }).toBuffer();
      variants.push({ width, format, buffer: out });
    }
  }
  return { master: master.data, width: master.info.width, height: master.info.height, variants };
}

const localStorage = {
  name: 'local',
  async put(key, buffer) {
    const file = path.resolve(env.storage.localDir, key);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, buffer);
    return `${env.publicApiUrl}/uploads/${key}`;
  },
};

const cloudinaryStorage = {
  name: 'cloudinary',
  async put(key, buffer) {
    const { cloudinaryCloud: cloud, cloudinaryKey: apiKey, cloudinarySecret: secret } = env.storage;
    if (!cloud || !apiKey || !secret) throw new AppError(503, 'Cloudinary is not configured', 'STORAGE_UNAVAILABLE');
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = key.replace(/\.[a-z0-9]+$/, '');
    const signature = crypto.createHash('sha1').update(`public_id=${publicId}&timestamp=${timestamp}${secret}`).digest('hex');
    const form = new FormData();
    form.append('file', new Blob([buffer]));
    form.append('public_id', publicId);
    form.append('timestamp', String(timestamp));
    form.append('api_key', apiKey);
    form.append('signature', signature);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: form });
    const body = await res.json();
    if (!res.ok) throw new AppError(502, body.error?.message || 'Upload failed', 'STORAGE_ERROR');
    return body.secure_url;
  },
};

const storages = { local: localStorage, cloudinary: cloudinaryStorage };

export async function storeImage(buffer, { alt = '' } = {}) {
  const storage = storages[env.storage.provider] || localStorage;
  const processed = await processImage(buffer);
  const id = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}`;
  const url = await storage.put(`artworks/${id}.jpg`, processed.master);
  const variants = [];
  for (const v of processed.variants) variants.push({ width: v.width, format: v.format, url: await storage.put(`artworks/${id}-${v.width}.${v.format}`, v.buffer) });
  return { url, alt, width: processed.width, height: processed.height, variants };
}

// Branded PDF documents: a public provenance dossier per artwork, and a certificate of
// authenticity issued to the owner of a confirmed order. Rendered with pdfkit (MIT);
// type is Libre Caslon (OFL), bundled in backend/assets/fonts.
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { Artwork, Order } from '../models/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const FONTS = path.resolve(here, '../../assets/fonts');
const PUBLIC_DIRS = [path.resolve(here, '../../../frontend/public'), path.resolve(here, '../../../frontend/dist')];
const INK = '#171715';
const MUTED = '#68645c';
const GOLD = '#7a5f2c';
const LINE = '#d8d1c5';
const PAPER = '#faf8f3';
const CONFIRMED = ['confirmed', 'preparing', 'shipped', 'delivered'];

function newDoc(options) {
  const doc = new PDFDocument({ size: 'A4', margin: 0, info: { Producer: 'Atelier Arc', Creator: 'Atelier Arc' }, ...options });
  doc.registerFont('display', path.join(FONTS, 'LibreCaslonDisplay-Regular.woff'));
  doc.registerFont('text', path.join(FONTS, 'LibreCaslonText-Regular.woff'));
  doc.registerFont('italic', path.join(FONTS, 'LibreCaslonText-Italic.woff'));
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(PAPER);
  return doc;
}

const label = (doc, text, x, y, opts = {}) => doc.font('Helvetica').fontSize(6.5).fillColor(opts.color || MUTED).text(text.toUpperCase(), x, y, { characterSpacing: 1.6, lineBreak: false, ...opts });
const rule = (doc, x1, y, x2, color = LINE) => doc.moveTo(x1, y).lineTo(x2, y).lineWidth(0.5).strokeColor(color).stroke();

function wordmark(doc, x, y, align = 'left', width = 200) {
  doc.font('display').fontSize(15).fillColor(INK).text('ATELIER', x, y, { characterSpacing: 3.2, width, align, lineBreak: false });
  doc.font('italic').fontSize(8).fillColor(GOLD).text('Arc', x, y + 16, { characterSpacing: 4, width, align, lineBreak: false });
}

// Local /art paths are read from disk; remote https images are fetched with a timeout and size cap.
export async function loadImage(url) {
  if (!url) return null;
  try {
    let buf;
    if (url.startsWith('/') && !url.startsWith('//')) {
      const rel = path.normalize(url).replace(/^[/\\]+/, '');
      for (const dir of PUBLIC_DIRS) {
        const file = path.join(dir, rel);
        if (!file.startsWith(dir)) return null;
        buf = await fs.readFile(file).catch(() => null);
        if (buf) break;
      }
    } else if (/^https:\/\//.test(url)) {
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) return null;
      const len = Number(res.headers.get('content-length') || 0);
      if (len > 12e6) return null;
      buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 12e6) return null;
    }
    if (!buf) return null;
    return await sharp(buf).rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  } catch {
    return null;
  }
}

const dims = (d) => (d?.width ? `${d.width} × ${d.height}${d.depth ? ` × ${d.depth}` : ''} ${d.unit || 'cm'}` : '—');

async function findArtwork(slug) {
  const artwork = await Artwork.findOne({ slug, published: true }).populate('artist', 'name nationality').lean();
  if (!artwork) throw new AppError(404, 'Artwork not found', 'NOT_FOUND');
  return artwork;
}

function toBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

function footer(doc, left, right) {
  const y = doc.page.height - 48;
  rule(doc, 56, y - 12, doc.page.width - 56);
  label(doc, left, 56, y);
  label(doc, right, 56, y, { width: doc.page.width - 112, align: 'right' });
}

export async function provenanceDossier(slug) {
  const a = await findArtwork(slug);
  const img = await loadImage(a.images?.[0]?.url);
  const doc = newDoc({ info: { Title: `${a.title} — Provenance dossier`, Author: 'Atelier Arc' } });
  const W = doc.page.width;
  const M = 56;

  // Page 1: the work.
  wordmark(doc, M, 48);
  label(doc, 'Provenance & condition dossier', M, 56, { width: W - 2 * M, align: 'right' });
  rule(doc, M, 84, W - M);
  if (img) {
    const meta = await sharp(img).metadata();
    const boxW = W - 2 * M - 120;
    const boxH = 380;
    const scale = Math.min(boxW / meta.width, boxH / meta.height);
    const w = meta.width * scale;
    const h = meta.height * scale;
    const x = (W - w) / 2;
    const y = 120 + (boxH - h) / 2;
    doc.image(img, x, y, { width: w, height: h });
    doc.rect(x, y, w, h).lineWidth(0.5).strokeColor(INK).strokeOpacity(0.12).stroke().strokeOpacity(1);
  }
  doc.font('display').fontSize(34).fillColor(INK).text(a.title, M, 526, { width: W - 2 * M, characterSpacing: -0.6 });
  doc.font('italic').fontSize(13).fillColor(INK).text(a.artist?.name || '', M, doc.y + 4);
  const rows = [
    ['Year', a.year || '—'],
    ['Medium', a.medium || '—'],
    ['Dimensions', dims(a.dimensions)],
    ['Edition', a.edition || 'Unique work'],
    ['Category', a.category || '—'],
  ];
  let y = doc.y + 22;
  for (const [k, v] of rows) {
    rule(doc, M, y, W - M);
    label(doc, k, M, y + 9);
    doc.font('text').fontSize(9.5).fillColor(INK).text(String(v), M, y + 7, { width: W - 2 * M, align: 'right' });
    y += 26;
  }
  rule(doc, M, y, W - M);
  footer(doc, `Ref. ${a.slug}`, 'atelier arc · original contemporary art');

  // Page 2: the record.
  doc.addPage({ size: 'A4', margin: 0 });
  doc.rect(0, 0, W, doc.page.height).fill(PAPER);
  wordmark(doc, M, 48);
  label(doc, a.title, M, 56, { width: W - 2 * M, align: 'right' });
  rule(doc, M, 84, W - M);
  y = 120;
  const section = (n, title, body) => {
    doc.font('italic').fontSize(10).fillColor(GOLD).text(n, M, y, { lineBreak: false });
    doc.font('display').fontSize(20).fillColor(INK).text(title, M + 34, y - 6);
    y = doc.y + 8;
    if (Array.isArray(body)) {
      body.forEach((line, i) => {
        doc.font('Helvetica').fontSize(7).fillColor(MUTED).text(String(i + 1).padStart(2, '0'), M + 34, y + 2, { lineBreak: false });
        doc.font('text').fontSize(10).fillColor(INK).text(line, M + 60, y, { width: W - 2 * M - 60 });
        y = doc.y + 6;
      });
    } else {
      doc.font('text').fontSize(10).fillColor(INK).text(body, M + 34, y, { width: W - 2 * M - 34, lineGap: 3 });
      y = doc.y;
    }
    y += 22;
    rule(doc, M, y - 10, W - M);
    y += 8;
  };
  section('01', 'Provenance', a.provenance?.length ? a.provenance : ['Acquired directly from the artist’s studio.']);
  section('02', 'Condition', a.condition ? `${a.condition}. Examined by Atelier Arc before listing; a detailed condition report is available on request.` : 'Available on request.');
  section('03', 'Authenticity', `${a.certificate || 'Certificate of authenticity'}. A numbered certificate is issued to the collector on acquisition and can be verified online.`);
  section('04', 'About the work', a.description || '—');
  section('05', 'Shipping and care', a.shipping || 'Specialist art handling with insured delivery.');
  doc.font('italic').fontSize(8.5).fillColor(MUTED).text('This dossier summarises the gallery’s records at the date of issue. It is provided for information and is not a certificate of authenticity.', M, Math.max(y, 700), { width: W - 2 * M });
  footer(doc, `Issued ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, `${env.publicSiteUrl.replace(/^https?:\/\//, '')}/artworks/${a.slug}`);
  return { filename: `${a.slug}-provenance.pdf`, buffer: await toBuffer(doc) };
}

// Certificate numbers are the order number plus the line index; the code is an HMAC so it
// cannot be guessed, and verification re-derives it from the stored order.
export function certificateCode(orderNumber, artworkId) {
  const mac = crypto.createHmac('sha256', env.certificateSecret).update(`${orderNumber}:${artworkId}`).digest('hex').slice(0, 10).toUpperCase();
  return `${orderNumber}.${mac}`;
}

export async function verifyCertificate(code) {
  const [number, mac] = String(code).split('.');
  if (!number || !mac || mac.length !== 10) return { valid: false };
  const order = await Order.findOne({ number, status: { $in: CONFIRMED } }).lean();
  if (!order) return { valid: false };
  const item = order.items.find((i) => {
    const expected = certificateCode(number, String(i.artwork));
    return expected.length === code.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(code));
  });
  if (!item) return { valid: false };
  return { valid: true, title: item.title, artist: item.artistName, issuedAt: order.payment?.paidAt || order.updatedAt };
}

export async function certificateForOwner(userId, orderNumber, artworkId, isStaff = false) {
  if (!isStaff && !userId) throw new AppError(401, 'Sign in to download certificates', 'UNAUTHENTICATED');
  const order = await Order.findOne({ number: orderNumber, ...(isStaff ? {} : { user: userId }), status: { $in: CONFIRMED } }).lean();
  if (!order) throw new AppError(404, 'Certificates are available once the order is confirmed', 'NOT_FOUND');
  const item = order.items.find((i) => String(i.artwork) === String(artworkId));
  if (!item) throw new AppError(404, 'This work is not part of the order', 'NOT_FOUND');
  const a = await Artwork.findById(item.artwork).populate('artist', 'name').lean();
  const img = await loadImage(item.image || a?.images?.[0]?.url);
  const code = certificateCode(order.number, String(item.artwork));
  const issued = new Date(order.payment?.paidAt || order.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const owner = order.shippingAddress?.name || order.email;

  const doc = newDoc({ layout: 'landscape', info: { Title: `Certificate of authenticity — ${item.title}`, Author: 'Atelier Arc' } });
  const W = doc.page.width;
  const H = doc.page.height;
  doc.rect(28, 28, W - 56, H - 56).lineWidth(0.6).strokeColor(GOLD).stroke();
  doc.rect(34, 34, W - 68, H - 68).lineWidth(0.3).strokeColor(GOLD).stroke();
  wordmark(doc, 0, 62, 'center', W);
  doc.font('display').fontSize(30).fillColor(INK).text('Certificate of Authenticity', 0, 112, { width: W, align: 'center', characterSpacing: -0.4 });
  label(doc, `No. ${order.number}-${order.items.indexOf(item) + 1}`, 0, 152, { width: W, align: 'center', color: GOLD });

  const left = 90;
  const imgBox = 200;
  if (img) {
    const meta = await sharp(img).metadata();
    const s = Math.min(imgBox / meta.width, (imgBox * 1.25) / meta.height);
    doc.image(img, left, 190, { width: meta.width * s, height: meta.height * s });
    doc.rect(left, 190, meta.width * s, meta.height * s).lineWidth(0.5).strokeColor(INK).strokeOpacity(0.12).stroke().strokeOpacity(1);
  }
  const x = left + imgBox + 50;
  const colW = W - x - 90;
  doc.font('text').fontSize(10).fillColor(MUTED).text('This is to certify that the work described below is an original by the artist named, acquired through Atelier Arc.', x, 192, { width: colW, lineGap: 3 });
  doc.font('display').fontSize(24).fillColor(INK).text(item.title, x, doc.y + 16, { width: colW });
  doc.font('italic').fontSize(12).fillColor(INK).text(item.artistName || a?.artist?.name || '', x, doc.y + 2, { width: colW });
  let y = doc.y + 16;
  for (const [k, v] of [
    ['Year', a?.year || '—'],
    ['Medium', a?.medium || '—'],
    ['Dimensions', dims(a?.dimensions)],
    ['Edition', a?.edition || 'Unique work'],
    ['Issued to', owner],
    ['Date of issue', issued],
  ]) {
    rule(doc, x, y, x + colW);
    label(doc, k, x, y + 8);
    doc.font('text').fontSize(9.5).fillColor(INK).text(String(v), x, y + 6, { width: colW, align: 'right' });
    y += 22;
  }
  rule(doc, x, y, x + colW);
  rule(doc, x, H - 118, x + 180, INK);
  label(doc, 'For Atelier Arc', x, H - 110);
  label(doc, 'Verify this certificate', x + colW - 200, H - 124, { width: 200, align: 'right' });
  doc.font('Courier').fontSize(8.5).fillColor(INK).text(code, x + colW - 200, H - 112, { width: 200, align: 'right' });
  doc.font('Helvetica').fontSize(6.5).fillColor(MUTED).text(`${env.publicSiteUrl.replace(/^https?:\/\//, '')}/verify/${code}`, x + colW - 260, H - 98, { width: 260, align: 'right' });
  return { filename: `certificate-${order.number}-${order.items.indexOf(item) + 1}.pdf`, buffer: await toBuffer(doc) };
}

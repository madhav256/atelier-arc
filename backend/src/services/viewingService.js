import { Viewing, Artwork, User, nextSequence } from '../models/index.js';
import { AppError } from '../lib/errors.js';
import { notify } from './notificationService.js';
import { sendEmail } from '../providers/email/index.js';
import { templates } from '../providers/email/templates.js';

// Gallery hours for private viewings, in India Standard Time (UTC+5:30, no daylight saving).
// Tuesday to Saturday, four 45-minute appointments a day, booked at least 24 hours ahead and
// up to 21 days out. Virtual viewings use the same slots.
export const LOCATIONS = {
  mumbai: { label: 'Mumbai gallery', address: 'By appointment, Colaba, Mumbai' },
  'new-delhi': { label: 'New Delhi gallery', address: 'By appointment, Lodhi Colony, New Delhi' },
  virtual: { label: 'Virtual viewing', address: 'Video call; the link is sent the day before' },
};
const TIMES = ['11:00', '12:30', '14:30', '16:00'];
const OPEN_DAYS = [2, 3, 4, 5, 6];
const LEAD_MS = 24 * 3600e3;
const HORIZON_DAYS = 21;
const IST_OFFSET = 330;

const istDate = (d) => new Date(d.getTime() + IST_OFFSET * 60e3); // shifted: read with getUTC*
const fromIst = (y, m, day, hh, mm) => new Date(Date.UTC(y, m, day, hh, mm) - IST_OFFSET * 60e3);

export function slotTimes(now = new Date(), days = HORIZON_DAYS) {
  const out = [];
  const start = istDate(now);
  for (let i = 0; i <= days; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i));
    if (!OPEN_DAYS.includes(d.getUTCDay())) continue;
    for (const t of TIMES) {
      const [hh, mm] = t.split(':').map(Number);
      const at = fromIst(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hh, mm);
      if (at.getTime() - now.getTime() >= LEAD_MS) out.push(at);
    }
  }
  return out;
}

export async function availableSlots(location, now = new Date()) {
  if (!LOCATIONS[location]) throw new AppError(422, 'Choose a gallery or a virtual viewing', 'INVALID_LOCATION');
  const times = slotTimes(now);
  const taken = await Viewing.find({ location, status: 'confirmed', startsAt: { $in: times } }).select('startsAt').lean();
  const busy = new Set(taken.map((v) => v.startsAt.getTime()));
  return times.map((t) => ({ startsAt: t.toISOString(), available: !busy.has(t.getTime()) }));
}

export const formatIst = (d) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }).format(d);

export async function book(userId, { location, startsAt, artworkId, notes, phone }, now = new Date()) {
  const at = new Date(startsAt);
  if (!LOCATIONS[location]) throw new AppError(422, 'Choose a gallery or a virtual viewing', 'INVALID_LOCATION');
  if (!slotTimes(now).some((t) => t.getTime() === at.getTime())) throw new AppError(422, 'That time is not an available viewing slot', 'INVALID_SLOT');
  const user = await User.findById(userId).lean();
  if (!user) throw new AppError(401, 'Sign in to book a viewing', 'AUTH_REQUIRED');
  const artwork = artworkId ? await Artwork.findOne({ _id: artworkId, published: true }).select('title slug').lean() : null;
  if (artworkId && !artwork) throw new AppError(404, 'Artwork not found', 'NOT_FOUND');
  const open = await Viewing.countDocuments({ user: userId, status: 'confirmed', startsAt: { $gt: now } });
  if (open >= 3) throw new AppError(409, 'You already have three upcoming viewings. Cancel one to book another.', 'VIEWING_LIMIT');
  let viewing;
  try {
    viewing = await Viewing.create({
      reference: `VW-${String(await nextSequence('viewing')).padStart(5, '0')}`,
      user: userId,
      artwork: artwork?._id,
      location,
      startsAt: at,
      name: user.name,
      email: user.email,
      phone,
      notes,
    });
  } catch (err) {
    if (err.code === 11000) throw new AppError(409, 'That slot has just been taken. Please choose another time.', 'SLOT_TAKEN');
    throw err;
  }
  await sendEmail({ to: user.email, ...templates.viewingConfirmed({ viewing, artworkTitle: artwork?.title, location: LOCATIONS[location], when: formatIst(at) }) });
  const staff = await User.find({ role: { $in: ['admin', 'advisor'] }, disabled: { $ne: true } }).select('_id').lean();
  await Promise.all(staff.map((s) => notify(s._id, { type: 'system', title: `Viewing booked ${viewing.reference}`, message: `${user.name} · ${LOCATIONS[location].label} · ${formatIst(at)}${artwork ? ` · ${artwork.title}` : ''}`, link: '/admin/viewings', email: false })));
  return viewing;
}

export async function mine(userId) {
  return Viewing.find({ user: userId }).sort({ startsAt: -1 }).limit(50).populate('artwork', 'title slug images').lean();
}

export async function cancel(userId, id, now = new Date()) {
  const v = await Viewing.findOne({ _id: id, user: userId });
  if (!v) throw new AppError(404, 'Viewing not found', 'NOT_FOUND');
  if (v.status !== 'confirmed' || v.startsAt <= now) throw new AppError(409, 'This viewing can no longer be cancelled', 'INVALID_STATE');
  v.status = 'cancelled';
  v.cancelledAt = now;
  v.cancelledBy = 'collector';
  await v.save();
  await sendEmail({ to: v.email, ...templates.notification({ title: `Viewing cancelled · ${v.reference}`, message: `Your ${LOCATIONS[v.location].label.toLowerCase()} on ${formatIst(v.startsAt)} is cancelled. You can book another time whenever you like.`, link: '/viewings/book' }) });
  return v;
}

export async function list({ status, upcoming } = {}, now = new Date()) {
  const q = {};
  if (status) q.status = status;
  if (upcoming) q.startsAt = { $gte: new Date(now.getTime() - 3600e3) };
  return Viewing.find(q).sort({ startsAt: upcoming ? 1 : -1 }).limit(200).populate('artwork', 'title slug').lean();
}

const STAFF_TRANSITIONS = { confirmed: ['completed', 'no_show', 'cancelled'], cancelled: [], completed: [], no_show: [] };

export async function setStatus(id, { status, note }) {
  const v = await Viewing.findById(id);
  if (!v) throw new AppError(404, 'Viewing not found', 'NOT_FOUND');
  if (!STAFF_TRANSITIONS[v.status].includes(status)) throw new AppError(409, `A ${v.status} viewing cannot become ${status}`, 'INVALID_STATE');
  v.status = status;
  if (note) v.staffNote = note;
  if (status === 'cancelled') {
    v.cancelledAt = new Date();
    v.cancelledBy = 'gallery';
    await sendEmail({ to: v.email, ...templates.notification({ title: `Viewing cancelled · ${v.reference}`, message: `We are sorry: we have had to cancel your viewing on ${formatIst(v.startsAt)}.${note ? ` ${note}` : ''} Please choose another time.`, link: '/viewings/book' }) });
  }
  await v.save();
  return v;
}

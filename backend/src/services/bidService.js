// Collector offers on listed works ("Make an offer").
// pending -> countered -> accepted | declined | withdrawn; the client may revise a pending or countered offer.
// Acceptance reuses the private-offer machinery: it opens inquiry.offer at the agreed price, which the
// collector pays through the existing offer checkout (so holds, payment and order states are unchanged).
import { Inquiry, Artwork, User, nextSequence } from '../models/index.js';
import { AppError } from '../lib/errors.js';
import { notify } from './notificationService.js';
import { pickAdvisor, getStaffInquiry, clientInquiry } from './inquiryService.js';

export const OFFER_FLOOR = 0.6; // offers below 60% of the list price are not accepted online
export const ACCEPTED_OFFER_DAYS = 3;
const OPEN = ['pending', 'countered'];

const fmt = (n, c = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n);

function checkAmount(artwork, amount) {
  if (amount >= artwork.price) throw new AppError(422, 'At or above the list price, you can acquire the work directly.', 'OFFER_AT_LIST');
  if (amount < Math.ceil(artwork.price * OFFER_FLOOR)) throw new AppError(422, `Offers start from ${fmt(Math.ceil(artwork.price * OFFER_FLOOR), artwork.currency)} for this work.`, 'OFFER_TOO_LOW');
}

function assertOfferable(artwork) {
  if (!artwork || !artwork.published) throw new AppError(404, 'Artwork not found', 'NOT_FOUND');
  if (artwork.availability !== 'available' || !(artwork.stock > 0)) throw new AppError(409, 'This work is not available for offers', 'ARTWORK_UNAVAILABLE');
  if (artwork.priceOnRequest || !artwork.price) throw new AppError(422, 'This work is priced on request. Please speak with an advisor.', 'PRICE_ON_REQUEST');
}

export async function createBid(userId, { artworkId, amount, note }) {
  const [artwork, user] = await Promise.all([Artwork.findById(artworkId).lean(), User.findById(userId).lean()]);
  assertOfferable(artwork);
  checkAmount(artwork, amount);
  const existing = await Inquiry.findOne({ user: userId, artwork: artworkId, type: 'offer', 'bid.status': { $in: OPEN } }).lean();
  if (existing) throw new AppError(409, 'You already have an open offer on this work. You can revise it from your account.', 'OFFER_EXISTS', { inquiryId: String(existing._id) });
  const advisor = await pickAdvisor();
  const reference = `INQ-${String(await nextSequence('inquiry')).padStart(6, '0')}`;
  const message = `Offer of ${fmt(amount, artwork.currency)} on ${artwork.title}.${note ? ` ${note}` : ''}`;
  const inquiry = await Inquiry.create({
    reference,
    user: userId,
    artwork: artwork._id,
    type: 'offer',
    name: user.name,
    email: user.email,
    message,
    advisor,
    status: 'negotiation',
    priority: artwork.price >= 1_000_000 ? 'high' : 'normal',
    messages: [{ from: 'client', author: userId, text: message }],
    history: [{ status: 'negotiation', by: userId }],
    bid: { amount, currency: artwork.currency || 'INR', status: 'pending', events: [{ by: 'client', action: 'offered', amount, note }] },
  });
  await Artwork.updateOne({ _id: artwork._id }, { $inc: { inquiryCount: 1 } });
  if (advisor) await notify(advisor, { type: 'inquiry', title: `New offer · ${reference}`, message, link: `/admin/inquiries/${inquiry._id}` });
  await notify(userId, { type: 'inquiry', title: 'Offer received', message: `We have your offer of ${fmt(amount, artwork.currency)} on ${artwork.title}. Your advisor will respond shortly.`, link: `/account/inquiries/${inquiry._id}`, email: true });
  return inquiry;
}

function openPrivateOffer(inquiry, amount, byUser) {
  if (inquiry.offer?.status === 'open') throw new AppError(409, 'There is already an open private offer on this inquiry', 'OFFER_OPEN');
  inquiry.offer = { amount, currency: inquiry.bid.currency, expiresAt: new Date(Date.now() + ACCEPTED_OFFER_DAYS * 864e5), status: 'open' };
  inquiry.bid.status = 'accepted';
  inquiry.history.push({ status: 'negotiation', by: byUser });
  inquiry.lastActivityAt = new Date();
}

async function staffBid(user, id) {
  const inquiry = await getStaffInquiry(user, id);
  if (!inquiry.bid?.status) throw new AppError(404, 'No collector offer on this inquiry', 'NO_BID');
  if (!OPEN.includes(inquiry.bid.status)) throw new AppError(409, `This offer is already ${inquiry.bid.status}`, 'BID_CLOSED');
  return inquiry;
}

async function stillAvailable(inquiry) {
  const art = await Artwork.findById(inquiry.artwork._id || inquiry.artwork).lean();
  if (!art || art.availability !== 'available' || !(art.stock > 0)) throw new AppError(409, 'This work is no longer available', 'ARTWORK_UNAVAILABLE');
  return art;
}

export async function staffAccept(user, id, { note } = {}) {
  const inquiry = await staffBid(user, id);
  if (inquiry.bid.status !== 'pending') throw new AppError(409, 'Accept the collector’s current offer only while it is pending', 'BID_NOT_PENDING');
  await stillAvailable(inquiry);
  openPrivateOffer(inquiry, inquiry.bid.amount, user.sub);
  inquiry.bid.events.push({ by: 'staff', action: 'accepted', amount: inquiry.bid.amount, note });
  await inquiry.save();
  await notify(inquiry.user, { type: 'inquiry', title: 'Your offer was accepted', message: `Your offer of ${fmt(inquiry.bid.amount, inquiry.bid.currency)} on ${inquiry.artwork.title} was accepted. Complete your acquisition within ${ACCEPTED_OFFER_DAYS} days.`, link: `/account/inquiries/${inquiry._id}`, email: true });
  return inquiry;
}

export async function staffCounter(user, id, { amount, note }) {
  const inquiry = await staffBid(user, id);
  const art = await stillAvailable(inquiry);
  if (amount <= inquiry.bid.amount) throw new AppError(422, 'A counter-offer should be above the collector’s offer. To agree, accept it instead.', 'COUNTER_TOO_LOW');
  if (amount > art.price) throw new AppError(422, 'A counter-offer cannot exceed the list price', 'COUNTER_TOO_HIGH');
  inquiry.bid.status = 'countered';
  inquiry.bid.counterAmount = amount;
  inquiry.bid.events.push({ by: 'staff', action: 'countered', amount, note });
  if (note) inquiry.messages.push({ from: 'advisor', author: user.sub, text: note });
  inquiry.lastActivityAt = new Date();
  await inquiry.save();
  await notify(inquiry.user, { type: 'inquiry', title: 'A counter-offer is ready', message: `Your advisor proposed ${fmt(amount, inquiry.bid.currency)} for ${inquiry.artwork.title}.`, link: `/account/inquiries/${inquiry._id}`, email: true });
  return inquiry;
}

export async function staffDecline(user, id, { note } = {}) {
  const inquiry = await staffBid(user, id);
  inquiry.bid.status = 'declined';
  inquiry.bid.events.push({ by: 'staff', action: 'declined', amount: inquiry.bid.amount, note });
  if (note) inquiry.messages.push({ from: 'advisor', author: user.sub, text: note });
  inquiry.lastActivityAt = new Date();
  await inquiry.save();
  await notify(inquiry.user, { type: 'inquiry', title: 'About your offer', message: `Your offer on ${inquiry.artwork.title} was not accepted.${note ? ` ${note}` : ''}`, link: `/account/inquiries/${inquiry._id}`, email: true });
  return inquiry;
}

async function clientBid(userId, id) {
  const inquiry = await clientInquiry(userId, id);
  if (!inquiry.bid?.status) throw new AppError(404, 'No offer on this inquiry', 'NO_BID');
  if (!OPEN.includes(inquiry.bid.status)) throw new AppError(409, `This offer is already ${inquiry.bid.status}`, 'BID_CLOSED');
  return inquiry;
}

const tellAdvisor = (inquiry, title, message) => inquiry.advisor && notify(inquiry.advisor._id || inquiry.advisor, { type: 'inquiry', title: `${title} · ${inquiry.reference}`, message, link: `/admin/inquiries/${inquiry._id}` });

export async function clientAcceptCounter(userId, id) {
  const inquiry = await clientBid(userId, id);
  if (inquiry.bid.status !== 'countered') throw new AppError(409, 'There is no counter-offer to accept', 'NO_COUNTER');
  await stillAvailable(inquiry);
  inquiry.bid.amount = inquiry.bid.counterAmount;
  openPrivateOffer(inquiry, inquiry.bid.counterAmount, userId);
  inquiry.bid.events.push({ by: 'client', action: 'accepted', amount: inquiry.bid.counterAmount });
  await inquiry.save();
  await tellAdvisor(inquiry, 'Counter-offer accepted', `${inquiry.name} accepted ${fmt(inquiry.bid.counterAmount, inquiry.bid.currency)}.`);
  return inquiry;
}

export async function clientRevise(userId, id, { amount, note }) {
  const inquiry = await clientBid(userId, id);
  const art = await stillAvailable(inquiry);
  checkAmount(art, amount);
  if (amount <= inquiry.bid.amount) throw new AppError(422, 'A revised offer should be above your previous offer', 'REVISE_TOO_LOW');
  inquiry.bid.amount = amount;
  inquiry.bid.status = 'pending';
  inquiry.bid.counterAmount = undefined;
  inquiry.bid.events.push({ by: 'client', action: 'revised', amount, note });
  inquiry.lastActivityAt = new Date();
  await inquiry.save();
  await tellAdvisor(inquiry, 'Offer revised', `${inquiry.name} revised their offer to ${fmt(amount, inquiry.bid.currency)}.`);
  return inquiry;
}

export async function clientWithdraw(userId, id) {
  const inquiry = await clientBid(userId, id);
  inquiry.bid.status = 'withdrawn';
  inquiry.bid.events.push({ by: 'client', action: 'withdrawn', amount: inquiry.bid.amount });
  inquiry.lastActivityAt = new Date();
  await inquiry.save();
  await tellAdvisor(inquiry, 'Offer withdrawn', `${inquiry.name} withdrew their offer.`);
  return inquiry;
}

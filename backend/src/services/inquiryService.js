import { Inquiry, User, Artwork, nextSequence } from '../models/index.js';
import { AppError } from '../lib/errors.js';
import { notify } from './notificationService.js';
import { sendEmail } from '../providers/email/index.js';
import { templates } from '../providers/email/templates.js';

export const INQUIRY_TRANSITIONS = {
  new: ['contacted', 'viewing_scheduled', 'closed'],
  contacted: ['viewing_scheduled', 'negotiation', 'closed'],
  viewing_scheduled: ['negotiation', 'contacted', 'closed'],
  negotiation: ['acquired', 'closed', 'viewing_scheduled'],
  acquired: [],
  closed: ['contacted'],
};

// Assigns the advisor with the fewest open inquiries.
export async function pickAdvisor() {
  const advisors = await User.find({ role: { $in: ['advisor'] }, disabled: { $ne: true } }).select('_id').lean();
  if (!advisors.length) return null;
  const load = await Inquiry.aggregate([
    { $match: { advisor: { $in: advisors.map((a) => a._id) }, status: { $nin: ['acquired', 'closed'] } } },
    { $group: { _id: '$advisor', open: { $sum: 1 } } },
  ]);
  const counts = new Map(load.map((l) => [String(l._id), l.open]));
  return advisors.sort((a, b) => (counts.get(String(a._id)) || 0) - (counts.get(String(b._id)) || 0))[0]._id;
}

export async function createInquiry(input, userId) {
  let artwork;
  if (input.artwork) {
    artwork = await Artwork.findOne({ _id: input.artwork, published: true }).lean();
    if (!artwork) throw new AppError(404, 'Artwork not found', 'NOT_FOUND');
  }
  const advisor = await pickAdvisor();
  const reference = `INQ-${String(await nextSequence('inquiry')).padStart(6, '0')}`;
  const highValue = artwork && (artwork.priceOnRequest || artwork.price >= 1_000_000);
  const inquiry = await Inquiry.create({
    ...input,
    reference,
    user: userId,
    advisor,
    priority: highValue ? 'high' : 'normal',
    type: input.type || (artwork ? 'artwork' : 'advisory'),
    messages: [{ from: 'client', author: userId, text: input.message }],
    history: [{ status: 'new', by: userId }],
  });
  if (artwork) await Artwork.updateOne({ _id: artwork._id }, { $inc: { inquiryCount: 1 } });
  await sendEmail({ to: inquiry.email, ...templates.inquiryReceived({ inquiry, artworkTitle: artwork?.title }) });
  if (advisor) {
    const advisorUser = await User.findById(advisor).lean();
    await sendEmail({ to: advisorUser.email, ...templates.inquiryAssigned({ inquiry, artworkTitle: artwork?.title }) });
    await notify(advisor, { type: 'inquiry', title: `New inquiry ${reference}`, message: `${inquiry.name} asked about ${artwork?.title || 'advisory'}.`, link: `/admin/inquiries/${inquiry._id}`, email: false });
  }
  return inquiry;
}

// Advisors see only their own inquiries; admins see all.
export function staffScope(user) {
  return user.role === 'admin' ? {} : { advisor: user.sub };
}

export async function getStaffInquiry(user, id) {
  const inquiry = await Inquiry.findOne({ _id: id, ...staffScope(user) })
    .populate({ path: 'artwork', select: 'title slug images price priceOnRequest currency availability artist', populate: { path: 'artist', select: 'name' } })
    .populate('advisor', 'name email')
    .populate('notes.author', 'name')
    .populate('messages.author', 'name');
  if (!inquiry) throw new AppError(404, 'Inquiry not found', 'NOT_FOUND');
  return inquiry;
}

const touch = (inquiry) => {
  inquiry.lastActivityAt = new Date();
};

export async function changeStatus(user, id, status) {
  const inquiry = await getStaffInquiry(user, id);
  if (!INQUIRY_TRANSITIONS[inquiry.status].includes(status)) throw new AppError(409, `Cannot move from ${inquiry.status} to ${status}`, 'INVALID_TRANSITION');
  inquiry.status = status;
  inquiry.history.push({ status, by: user.sub });
  touch(inquiry);
  await inquiry.save();
  return inquiry;
}

export async function assign(user, id, advisorId) {
  if (user.role !== 'admin') throw new AppError(403, 'Only administrators can reassign inquiries', 'FORBIDDEN');
  const advisor = await User.findOne({ _id: advisorId, role: { $in: ['advisor', 'admin'] } });
  if (!advisor) throw new AppError(422, 'Choose a valid advisor', 'INVALID_ADVISOR');
  const inquiry = await getStaffInquiry(user, id);
  inquiry.advisor = advisor._id;
  touch(inquiry);
  await inquiry.save();
  await notify(advisor._id, { type: 'inquiry', title: `Inquiry ${inquiry.reference} assigned`, message: `${inquiry.name} is now your client.`, link: `/admin/inquiries/${inquiry._id}` });
  return inquiry;
}

export async function addNote(user, id, text) {
  const inquiry = await getStaffInquiry(user, id);
  inquiry.notes.push({ text, author: user.sub });
  touch(inquiry);
  await inquiry.save();
  return inquiry;
}

export async function staffReply(user, id, text) {
  const inquiry = await getStaffInquiry(user, id);
  inquiry.messages.push({ from: 'advisor', author: user.sub, text });
  if (inquiry.status === 'new') {
    inquiry.status = 'contacted';
    inquiry.history.push({ status: 'contacted', by: user.sub });
  }
  touch(inquiry);
  await inquiry.save();
  if (inquiry.user) await notify(inquiry.user, { type: 'inquiry', title: 'Your advisor replied', message: text.slice(0, 180), link: `/account/inquiries/${inquiry._id}` });
  else await sendEmail({ to: inquiry.email, ...templates.notification({ title: `Reply about ${inquiry.reference}`, message: text }) });
  return inquiry;
}

export async function scheduleAppointment(user, id, { startsAt, mode, location }) {
  const inquiry = await getStaffInquiry(user, id);
  if (new Date(startsAt) < new Date()) throw new AppError(422, 'Choose a future time', 'INVALID_DATE');
  inquiry.appointments.push({ startsAt, mode, location, status: 'proposed' });
  if (INQUIRY_TRANSITIONS[inquiry.status].includes('viewing_scheduled')) {
    inquiry.status = 'viewing_scheduled';
    inquiry.history.push({ status: 'viewing_scheduled', by: user.sub });
  }
  touch(inquiry);
  await inquiry.save();
  const when = new Date(startsAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
  const message = `Your advisor proposed a ${mode} viewing on ${when} IST${location ? ` at ${location}` : ''}.`;
  if (inquiry.user) await notify(inquiry.user, { type: 'inquiry', title: 'Viewing proposed', message, link: `/account/inquiries/${inquiry._id}` });
  else await sendEmail({ to: inquiry.email, ...templates.notification({ title: 'Viewing proposed', message }) });
  return inquiry;
}

export async function makeOffer(user, id, { amount, expiresInDays = 7 }) {
  const inquiry = await getStaffInquiry(user, id);
  if (!inquiry.artwork) throw new AppError(422, 'Offers need an artwork on the inquiry', 'NO_ARTWORK');
  if (!inquiry.user) throw new AppError(422, 'The client needs an account to accept an offer online', 'NO_ACCOUNT');
  if (inquiry.artwork.availability === 'sold') throw new AppError(409, 'This work has been sold', 'ARTWORK_UNAVAILABLE');
  inquiry.offer = { amount, currency: inquiry.artwork.currency || 'INR', expiresAt: new Date(Date.now() + expiresInDays * 864e5), status: 'open' };
  if (INQUIRY_TRANSITIONS[inquiry.status].includes('negotiation')) {
    inquiry.status = 'negotiation';
    inquiry.history.push({ status: 'negotiation', by: user.sub });
  }
  touch(inquiry);
  await inquiry.save();
  await notify(inquiry.user, { type: 'inquiry', title: 'A private offer is ready', message: `Your advisor prepared a private offer for ${inquiry.artwork.title}.`, link: `/account/inquiries/${inquiry._id}` });
  return inquiry;
}

export async function withdrawOffer(user, id) {
  const inquiry = await getStaffInquiry(user, id);
  if (inquiry.offer?.status !== 'open') throw new AppError(409, 'No open offer', 'NO_OFFER');
  inquiry.offer.status = 'withdrawn';
  await inquiry.save();
  return inquiry;
}

// Client-side views: the client never sees internal notes.
export async function clientInquiries(userId) {
  return Inquiry.find({ user: userId })
    .select('-notes')
    .populate({ path: 'artwork', select: 'title slug images availability artist', populate: { path: 'artist', select: 'name' } })
    .populate('advisor', 'name')
    .sort({ lastActivityAt: -1 })
    .lean();
}

export async function clientInquiry(userId, id) {
  const inquiry = await Inquiry.findOne({ _id: id, user: userId })
    .select('-notes')
    .populate({ path: 'artwork', select: 'title slug images availability price currency artist', populate: { path: 'artist', select: 'name' } })
    .populate('advisor', 'name');
  if (!inquiry) throw new AppError(404, 'Inquiry not found', 'NOT_FOUND');
  return inquiry;
}

export async function clientReply(userId, id, text) {
  const inquiry = await clientInquiry(userId, id);
  if (inquiry.status === 'closed') throw new AppError(409, 'This conversation is closed. Start a new inquiry.', 'CLOSED');
  inquiry.messages.push({ from: 'client', author: userId, text });
  touch(inquiry);
  await inquiry.save();
  if (inquiry.advisor) await notify(inquiry.advisor._id || inquiry.advisor, { type: 'inquiry', title: `Client replied · ${inquiry.reference}`, message: text.slice(0, 180), link: `/admin/inquiries/${inquiry._id}` });
  return inquiry;
}

export async function respondToAppointment(userId, id, appointmentId, status) {
  const inquiry = await clientInquiry(userId, id);
  const appt = inquiry.appointments.id(appointmentId);
  if (!appt) throw new AppError(404, 'Appointment not found', 'NOT_FOUND');
  appt.status = status;
  touch(inquiry);
  await inquiry.save();
  if (inquiry.advisor) await notify(inquiry.advisor._id || inquiry.advisor, { type: 'inquiry', title: `Viewing ${status}`, message: `${inquiry.name} ${status} the proposed viewing.`, link: `/admin/inquiries/${inquiry._id}` });
  return inquiry;
}

export async function declineOffer(userId, id) {
  const inquiry = await clientInquiry(userId, id);
  if (inquiry.offer?.status !== 'open') throw new AppError(409, 'No open offer', 'NO_OFFER');
  inquiry.offer.status = 'declined';
  await inquiry.save();
  return inquiry;
}

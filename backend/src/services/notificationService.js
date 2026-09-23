import { Notification, User, AvailabilityAlert } from '../models/index.js';
import { sendEmail } from '../providers/email/index.js';
import { templates } from '../providers/email/templates.js';

const SETTING_FOR_TYPE = { order: 'orders', inquiry: 'inquiries', availability: 'availability', recommendation: 'recommendations', artist: 'availability', collection: 'recommendations' };

// Creates an in-app notification and emails it when the user's settings allow.
export async function notify(userId, { type, title, message, link, email = true }) {
  if (!userId) return null;
  const notification = await Notification.create({ user: userId, type, title, message, link });
  if (email) {
    const user = await User.findById(userId).lean();
    const settings = user?.notificationSettings || {};
    const key = SETTING_FOR_TYPE[type];
    if (user && settings.email !== false && (!key || settings[key] !== false)) {
      await sendEmail({ to: user.email, ...templates.notification({ title, message, link }) });
    }
  }
  return notification;
}

export async function notifyAvailability(artwork) {
  const alerts = await AvailabilityAlert.find({ artwork: artwork._id, notifiedAt: null }).lean();
  for (const alert of alerts) {
    await notify(alert.user, {
      type: 'availability',
      title: `${artwork.title} is available again`,
      message: `A work you asked about, ${artwork.title}, is available to acquire.`,
      link: `/artworks/${artwork.slug}`,
    });
  }
  if (alerts.length) await AvailabilityAlert.updateMany({ _id: { $in: alerts.map((a) => a._id) } }, { notifiedAt: new Date() });
  return alerts.length;
}

export async function notifyArtistFollowers(artwork, artist) {
  const followers = await User.find({ followedArtists: artist._id }).select('_id').lean();
  for (const f of followers) {
    await notify(f._id, {
      type: 'artist',
      title: `New work by ${artist.name}`,
      message: `${artist.name} has a new work in the gallery: ${artwork.title}.`,
      link: `/artworks/${artwork.slug}`,
    });
  }
  return followers.length;
}

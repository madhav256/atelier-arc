import { env } from '../../config/env.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = (v, c = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(v || 0);

function layout(title, bodyHtml, cta) {
  return `<!doctype html><html><body style="margin:0;background:#f5f1ea;font-family:Georgia,serif;color:#1c1a17">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fffdf9;border:1px solid #e6dfd3">
<tr><td style="padding:32px 40px;border-bottom:1px solid #e6dfd3;letter-spacing:.3em;font-size:12px;text-transform:uppercase">Atelier Arc</td></tr>
<tr><td style="padding:40px"><h1 style="font-weight:400;font-size:26px;margin:0 0 24px">${esc(title)}</h1>${bodyHtml}
${cta ? `<p style="margin:32px 0 0"><a href="${esc(cta.url)}" style="background:#1c1a17;color:#fffdf9;padding:14px 28px;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.15em;text-transform:uppercase">${esc(cta.label)}</a></p>` : ''}
</td></tr><tr><td style="padding:24px 40px;border-top:1px solid #e6dfd3;font-family:Arial,sans-serif;font-size:11px;color:#7a7266">Atelier Arc · Contemporary art advisory. You are receiving this because of activity on your account.</td></tr>
</table></td></tr></table></body></html>`;
}

const p = (text) => `<p style="font-size:16px;line-height:1.6;margin:0 0 16px">${esc(text)}</p>`;

export const templates = {
  verifyEmail: ({ name, token }) => {
    const url = `${env.publicSiteUrl}/verify-email?token=${token}`;
    return {
      subject: 'Confirm your email address',
      text: `Hello ${name || ''},\n\nConfirm your email to finish setting up your Atelier Arc account:\n${url}\n\nThis link expires in 24 hours.`,
      html: layout('Confirm your email', p(`Hello ${name || ''},`) + p('Confirm your email to finish setting up your account. This link expires in 24 hours.'), { url, label: 'Confirm email' }),
    };
  },
  resetPassword: ({ name, token }) => {
    const url = `${env.publicSiteUrl}/reset-password?token=${token}`;
    return {
      subject: 'Reset your password',
      text: `Hello ${name || ''},\n\nUse this link to choose a new password. It expires in 30 minutes:\n${url}\n\nIf you did not ask for this, you can ignore this email.`,
      html: layout('Reset your password', p(`Hello ${name || ''},`) + p('Use the button below to choose a new password. It expires in 30 minutes. If you did not ask for this, you can ignore this email.'), { url, label: 'Choose new password' }),
    };
  },
  orderConfirmed: ({ order }) => {
    const url = `${env.publicSiteUrl}/account/orders/${order.number}`;
    const lines = order.items.map((i) => `${i.title} - ${i.artistName || ''} (${money(i.unitPrice, order.currency)})`).join('\n');
    return {
      subject: `Acquisition confirmed · ${order.number}`,
      text: `Thank you. Your acquisition ${order.number} is confirmed.\n\n${lines}\n\nTotal: ${money(order.total, order.currency)}\n\nTrack it here: ${url}`,
      html: layout(
        'Your acquisition is confirmed',
        p(`Order ${order.number}`) +
          order.items.map((i) => p(`${i.title} · ${i.artistName || ''} · ${money(i.unitPrice, order.currency)}`)).join('') +
          p(`Total ${money(order.total, order.currency)}`) +
          p('Our registrar will contact you to arrange specialist packing and insured delivery.'),
        { url, label: 'View order' },
      ),
    };
  },
  orderStatus: ({ order }) => ({
    subject: `Update on ${order.number}: ${order.status.replace('_', ' ')}`,
    text: `Your order ${order.number} is now ${order.status.replace('_', ' ')}.${order.tracking?.url ? `\nTracking: ${order.tracking.url}` : ''}`,
    html: layout('Order update', p(`Your order ${order.number} is now ${order.status.replace('_', ' ')}.`), order.tracking?.url ? { url: order.tracking.url, label: 'Track shipment' } : undefined),
  }),
  inquiryReceived: ({ inquiry, artworkTitle }) => ({
    subject: `We received your inquiry · ${inquiry.reference}`,
    text: `Dear ${inquiry.name},\n\nThank you for your interest${artworkTitle ? ` in ${artworkTitle}` : ''}. An advisor will reply within one business day.\n\nReference: ${inquiry.reference}`,
    html: layout('Thank you for your inquiry', p(`Dear ${inquiry.name},`) + p(`Thank you for your interest${artworkTitle ? ` in ${artworkTitle}` : ''}. An advisor will reply within one business day.`) + p(`Reference ${inquiry.reference}`)),
  }),
  inquiryAssigned: ({ inquiry, artworkTitle }) => {
    const url = `${env.publicSiteUrl}/admin/inquiries/${inquiry._id}`;
    return {
      subject: `New inquiry assigned · ${inquiry.reference}`,
      text: `${inquiry.name} (${inquiry.email}) asked about ${artworkTitle || 'advisory'}:\n\n${inquiry.message}\n\n${url}`,
      html: layout('New inquiry assigned to you', p(`${inquiry.name} · ${inquiry.email}`) + p(artworkTitle || 'Advisory request') + p(inquiry.message), { url, label: 'Open inquiry' }),
    };
  },
  notification: ({ title, message, link }) => ({
    subject: title,
    text: `${message}${link ? `\n\n${env.publicSiteUrl}${link}` : ''}`,
    html: layout(title, p(message), link ? { url: `${env.publicSiteUrl}${link}`, label: 'View' } : undefined),
  }),
};

import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

// Messages sent through the console provider are kept here so tests and local dev can read them.
export const outbox = [];

const consoleProvider = {
  name: 'console',
  async send(message) {
    const record = { ...message, id: `console_${Date.now()}_${outbox.length}`, sentAt: new Date() };
    outbox.push(record);
    if (outbox.length > 200) outbox.shift();
    if (!env.isTest) console.log(`[email:console] to=${message.to} subject="${message.subject}"\n${message.text}\n`);
    return { id: record.id };
  },
};

let transport;
const smtpProvider = {
  name: 'smtp',
  async send(message) {
    transport ??= nodemailer.createTransport({
      host: env.email.smtpHost,
      port: env.email.smtpPort,
      secure: env.email.smtpSecure,
      auth: env.email.smtpUser ? { user: env.email.smtpUser, pass: env.email.smtpPass } : undefined,
    });
    const info = await transport.sendMail({ from: env.email.from, ...message });
    return { id: info.messageId };
  },
};

const providers = { console: consoleProvider, smtp: smtpProvider };

export async function sendEmail(message, attempts = 3) {
  const provider = providers[env.email.provider] || consoleProvider;
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await provider.send(message);
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 200 * 2 ** i));
    }
  }
  console.error(JSON.stringify({ level: 'error', message: 'email delivery failed', to: message.to, subject: message.subject, error: lastError?.message }));
  return null;
}

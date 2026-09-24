import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';
const list = (value, fallback) => (value || fallback).split(',').map((s) => s.trim()).filter(Boolean);

if (isProd) {
  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'QUOTE_SECRET', 'MONGODB_URI']) {
    if (!process.env[key]) throw new Error(`Missing required environment variable ${key}`);
  }
  if (process.env.PAYMENT_PROVIDER === 'mock' || !process.env.PAYMENT_PROVIDER) {
    throw new Error('PAYMENT_PROVIDER=mock is not allowed in production');
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,
  isTest: process.env.NODE_ENV === 'test',
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/atelier_arc',
  accessSecret: process.env.JWT_ACCESS_SECRET || 'development-access-secret-change-me',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'development-refresh-secret-change-me',
  quoteSecret: process.env.QUOTE_SECRET || 'development-quote-secret-change-me',
  certificateSecret: process.env.CERTIFICATE_SECRET || process.env.QUOTE_SECRET || 'development-certificate-secret-change-me',
  clientOrigins: list(process.env.CLIENT_ORIGINS, 'http://localhost:5173'),
  publicSiteUrl: process.env.PUBLIC_SITE_URL || 'http://localhost:5173',
  publicApiUrl: process.env.PUBLIC_API_URL || 'http://localhost:4000',
  holdMinutes: Number(process.env.INVENTORY_HOLD_MINUTES || 30),
  payments: {
    provider: process.env.PAYMENT_PROVIDER || 'mock',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    mockWebhookSecret: process.env.MOCK_WEBHOOK_SECRET || 'mock-webhook-secret',
    // Monthly instalments through the gateway. Razorpay sets its own per-bank minimums;
    // EMI_MIN_AMOUNT is the lowest total at which the option is offered at all.
    emi: {
      enabled: process.env.EMI_ENABLED !== 'false',
      minAmount: Number(process.env.EMI_MIN_AMOUNT || 5000),
      tenures: list(process.env.EMI_TENURES, '3,6,9,12').map(Number).filter((n) => Number.isInteger(n) && n > 0),
    },
  },
  email: {
    provider: process.env.EMAIL_PROVIDER || 'console',
    from: process.env.EMAIL_FROM || 'Atelier Arc <no-reply@atelierarc.example>',
    smtpHost: process.env.SMTP_HOST,
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    smtpSecure: process.env.SMTP_SECURE === 'true',
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    localDir: process.env.UPLOAD_DIR || 'uploads',
    cloudinaryCloud: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryKey: process.env.CLOUDINARY_API_KEY,
    cloudinarySecret: process.env.CLOUDINARY_API_SECRET,
    clamavHost: process.env.CLAMAV_HOST,
    clamavPort: Number(process.env.CLAMAV_PORT || 3310),
  },
  search: { provider: process.env.SEARCH_PROVIDER || 'mongo', atlasIndex: process.env.ATLAS_SEARCH_INDEX || 'artworks' },
  google: { clientId: process.env.GOOGLE_CLIENT_ID || '566562303272-ksqt0kqqmgge27a9sevhafs7p2jltrbp.apps.googleusercontent.com' },
  commerce: {
    originCountry: process.env.ORIGIN_COUNTRY || 'IN',
    domesticTaxRate: Number(process.env.DOMESTIC_TAX_RATE ?? 0.12),
    insuranceRate: Number(process.env.INSURANCE_RATE ?? 0.01),
  },
};

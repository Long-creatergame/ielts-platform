const cors = require('cors');
const { escapeList } = require('./validateEnv');

const LOCALHOST_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:4000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4000',
  'http://127.0.0.1:5173',
];

const LOCALHOST_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

function buildWhitelist() {
  const envList = escapeList(process.env.CORS_WHITELIST || '');
  if (process.env.FRONTEND_URL) {
    envList.push(process.env.FRONTEND_URL.trim());
  }

  // Dev: allow localhost by default. Prod: only explicit allow-list.
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    return Array.from(new Set([...LOCALHOST_ORIGINS, ...envList.filter(Boolean)]));
  }
  return Array.from(new Set(envList.filter(Boolean)));
}

const whitelist = buildWhitelist();
const allowCredentials = String(process.env.CORS_ALLOW_CREDENTIALS || '').toLowerCase() === 'true';

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV !== 'production' && LOCALHOST_REGEX.test(origin)) {
      return callback(null, true);
    }

    if (whitelist.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  // Bearer-only by default; enable credentials only if you explicitly switch to cookie auth.
  credentials: allowCredentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Timezone', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400,
});

module.exports = corsMiddleware;
module.exports.allowedOrigins = whitelist;




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
  const combined = new Set([...LOCALHOST_ORIGINS, ...envList]);
  return Array.from(combined);
}

const whitelist = buildWhitelist();

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (LOCALHOST_REGEX.test(origin) || whitelist.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Timezone', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400,
});

module.exports = corsMiddleware;
module.exports.allowedOrigins = whitelist;




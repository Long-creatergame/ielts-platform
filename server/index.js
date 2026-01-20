const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const crypto = require('crypto');
const { validateEnv } = require('./config/validateEnv');
const corsMiddleware = require('./config/cors');
const timezoneMiddleware = require('./middleware/timezoneMiddleware');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const writingRoutes = require('./routes/writing');
const healthRoutes = require('./routes/health');
const opsRoutes = require('./routes/ops');

dotenv.config();
const { mongoUri } = validateEnv();

const app = express();
const PORT = process.env.PORT || 4000;

// Required for correct client IP handling behind proxies (Render/Vercel/etc.),
// especially for rate limiting.
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(corsMiddleware);
app.options('*', corsMiddleware);

// Request id + basic request logging (no secrets)
app.use((req, res, next) => {
  const incoming = req.headers['x-request-id'];
  const requestId =
    typeof incoming === 'string' && incoming.trim().length > 0 ? incoming.trim() : crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = Date.now();
  res.on('finish', () => {
    if (process.env.NODE_ENV === 'test') return;
    const ms = Date.now() - start;
    console.info('[Request]', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      ms,
    });
  });

  next();
});

app.use(timezoneMiddleware);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(mongoUri || 'mongodb://localhost:27017/ielts-writing')
    .then(() => console.log('[MongoDB] connected'))
    .catch((error) => {
      console.error('[MongoDB] connection error:', error.message);
      process.exit(1);
    });
}

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/writing', writingRoutes);
app.use('/api/health', healthRoutes);

// Ops endpoints (Render/UptimeRobot friendly)
app.use('/', opsRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Init] Writing AI server running on port ${PORT}`);
  });
}

module.exports = app;
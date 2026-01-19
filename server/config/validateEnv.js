const CORE_REQUIRED_VARS = ['JWT_SECRET'];

function escapeList(value = '') {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveMongoUri(env = process.env) {
  return env.MONGODB_URI || env.MONGO_URI || env.MONGO_URL || null;
}

function resolveFrontendUrl(env = process.env) {
  return env.FRONTEND_URL || env.CLIENT_URL || null;
}

function resolveSendgridFrom(env = process.env) {
  return env.SENDGRID_FROM || env.SENDGRID_FROM_EMAIL || null;
}

function validateEnv(env = process.env) {
  const isProduction = env.NODE_ENV === 'production';

  // Normalize aliases so the rest of the codebase can rely on consistent names.
  if (!env.FRONTEND_URL && env.CLIENT_URL) env.FRONTEND_URL = env.CLIENT_URL;
  if (!env.SENDGRID_FROM && env.SENDGRID_FROM_EMAIL) env.SENDGRID_FROM = env.SENDGRID_FROM_EMAIL;
  if (!env.MONGODB_URI && env.MONGO_URI) env.MONGODB_URI = env.MONGO_URI;

  const mongoUri = resolveMongoUri(env);
  if (!mongoUri) {
    const msg = '[Env] No MongoDB connection string detected.';
    if (isProduction) {
      console.error(msg);
      process.exit(1);
    } else {
      console.warn(msg);
    }
  }

  const missingCore = CORE_REQUIRED_VARS.filter((key) => !env[key]);
  const frontendUrl = resolveFrontendUrl(env);
  if (!frontendUrl) missingCore.push('FRONTEND_URL (or CLIENT_URL)');

  if (missingCore.length > 0) {
    const message = `Missing required environment variables: ${missingCore.join(', ')}`;
    if (isProduction) {
      console.error(`[Env] ${message}`);
      process.exit(1);
    } else {
      console.warn(`[Env] ${message}`);
    }
  }

  const whitelist = escapeList(env.CORS_WHITELIST || '');
  if (!whitelist.length) {
    console.warn('[Env] CORS_WHITELIST is empty. Only explicitly provided domains will be allowed.');
  }

  const aiConfigured = !!env.OPENAI_API_KEY;
  const emailConfigured = !!env.SENDGRID_API_KEY && !!resolveSendgridFrom(env);

  if (!aiConfigured) {
    console.warn('[Env] OPENAI_API_KEY is missing. AI scoring endpoints will return 503.');
  }
  if (!emailConfigured) {
    console.warn('[Env] SENDGRID config is missing. Password reset email endpoint will return 501.');
  }

  return {
    mongoUri,
    corsWhitelist: whitelist,
    frontendUrl,
    features: {
      ai: aiConfigured,
      email: emailConfigured,
    },
  };
}

module.exports = {
  validateEnv,
  resolveMongoUri,
  resolveFrontendUrl,
  resolveSendgridFrom,
  escapeList,
};




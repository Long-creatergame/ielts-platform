const REQUIRED_VARS = ['JWT_SECRET', 'CORS_WHITELIST', 'PORT'];
const OPTIONAL_VARS = ['OPENAI_API_KEY'];

const LOCAL_MONGO_KEYS = ['MONGODB_URI', 'MONGO_URI', 'MONGO_URL'];

function escapeList(value = '') {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveMongoUri(env = process.env) {
  for (const key of LOCAL_MONGO_KEYS) {
    if (env[key]) {
      return env[key];
    }
  }
  return null;
}

function validateEnv(env = process.env) {
  const missing = [];
  const mongoUri = resolveMongoUri(env);
  if (!mongoUri) {
    missing.push('MONGODB_URI');
  } else if (!env.MONGODB_URI) {
    console.warn('[Env] Using fallback Mongo connection string. Prefer MONGODB_URI for consistency.');
  }

  REQUIRED_VARS.forEach((key) => {
    if (!env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    const error = new Error(message);
    error.code = 'ENV_VALIDATION_ERROR';
    throw error;
  }

  OPTIONAL_VARS.forEach((key) => {
    if (!env[key]) {
      console.warn(`[Env] Optional variable ${key} is not set. Related features may be limited.`);
    }
  });

  if (!escapeList(env.CORS_WHITELIST).length) {
    console.warn('[Env] CORS_WHITELIST is defined but empty. Only localhost origins will be allowed.');
  }

  return {
    mongoUri,
    corsWhitelist: escapeList(env.CORS_WHITELIST),
  };
}

module.exports = {
  validateEnv,
  resolveMongoUri,
  escapeList,
};




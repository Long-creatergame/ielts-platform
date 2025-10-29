function requireEnv(vars) {
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`;
    console.error(msg);
    throw new Error(msg);
  }
}

function validateCriticalEnv() {
  // Critical to boot API
  requireEnv(['JWT_SECRET']);
  // At least one DB connection string
  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    console.warn('No MONGO_URI/MONGODB_URI provided. Attempting local connection.');
  }
}

module.exports = { validateCriticalEnv };



const allowedOriginsFromEnv = () => {
  const list = [];
  if (process.env.FRONTEND_URL) list.push(process.env.FRONTEND_URL);
  if (process.env.CORS_ORIGIN) list.push(process.env.CORS_ORIGIN);
  // Local development defaults
  list.push('http://localhost:5173', 'http://localhost:3000');
  return Array.from(new Set(list.filter(Boolean)));
};

const buildCorsOptions = () => {
  const whitelist = allowedOriginsFromEnv();
  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (whitelist.includes(origin)) {
        return callback(null, true);
      }
      // eslint-disable-next-line no-console
      console.warn(`[CORS] Blocked origin: ${origin}`);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Timezone', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400,
  };
};

module.exports = {
  buildCorsOptions,
};



/**
 * Timezone Middleware
 * Captures user's timezone from request headers and attaches to request object
 */
module.exports = (req, res, next) => {
  const tz = req.headers['x-timezone'] || req.headers['x-timezone-offset'] || 'UTC';
  req.userTimezone = tz;
  req.timezoneOffset = req.headers['x-timezone-offset'] ? parseInt(req.headers['x-timezone-offset']) : null;
  next();
};


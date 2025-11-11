/* Centralized error handler */
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error('[Error]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    path: req.originalUrl,
  });
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    error: status === 500 ? 'Internal server error' : err.message,
  });
};



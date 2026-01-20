function formatError(err) {
  if (!err) {
    return { message: 'Unknown error', code: 500 };
  }

  const statusCode = err.statusCode || err.status || 500;
  const safeMessage =
    statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  const errorResponse = {
    message: safeMessage,
    code: statusCode,
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    errorResponse.stack = err.stack;
  }

  return errorResponse;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const errorResponse = formatError(err);
  const requestId = req.requestId || req.headers['x-request-id'];

  console.error('[ErrorHandler]', {
    requestId,
    message: err?.message,
    code: errorResponse.code,
    path: req.originalUrl,
    method: req.method,
  });

  // Consistent validation error format
  if (err?.name === 'ValidationError' && Array.isArray(err.details)) {
    return res.status(errorResponse.code).json({
      success: false,
      message: errorResponse.message || 'Validation failed',
      errors: err.details,
      requestId,
    });
  }

  res.status(errorResponse.code).json({
    success: false,
    error: errorResponse,
    requestId,
  });
}

module.exports = errorHandler;






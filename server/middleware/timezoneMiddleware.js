/**
 * Middleware to extract and set user timezone and locale from request headers
 * Supports both timezone and language preferences
 */
module.exports = function timezoneMiddleware(req, res, next) {
  // Extract timezone from header
  const timezone = req.headers['x-timezone'] || req.headers['x-timezone-offset'] || 'UTC';
  req.userTimezone = timezone;

  // Extract language from Accept-Language header or custom header
  const acceptLanguage = req.headers['accept-language'] || '';
  const customLang = req.headers['x-language'] || req.headers['x-locale'];
  
  // Parse language (e.g., "en-US" -> "en" or "vi-VN" -> "vi")
  let lang = customLang || 'en';
  if (!customLang && acceptLanguage) {
    const langMatch = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
    lang = ['en', 'vi', 'zh', 'ja', 'ko'].includes(langMatch) ? langMatch : 'en';
  }
  
  req.userLanguage = lang;
  req.locale = lang;

  // Also set in res.locals for views (if using server-side rendering)
  res.locals.timezone = timezone;
  res.locals.language = lang;
  res.locals.locale = lang;

  next();
}

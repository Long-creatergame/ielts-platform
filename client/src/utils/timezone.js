/**
 * Timezone Utilities
 * Get user's timezone from browser
 */

/**
 * Get user's timezone from browser
 * @returns {string} IANA timezone identifier (e.g., "Asia/Ho_Chi_Minh")
 */
export const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('[Timezone] Failed to detect timezone, using UTC');
    return 'UTC';
  }
};

/**
 * Get timezone offset in minutes
 * @returns {number} Offset in minutes (e.g., 420 for UTC+7)
 */
export const getTimezoneOffset = () => {
  return new Date().getTimezoneOffset() * -1; // Invert to get UTC offset
};

/**
 * Get timezone abbreviation (e.g., "GMT+7", "PST")
 * @returns {string}
 */
export const getTimezoneAbbr = () => {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(date);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName');
    return timeZoneName ? timeZoneName.value : 'UTC';
  } catch (error) {
    return 'UTC';
  }
};


/**
 * Date Format Utilities
 * Format UTC timestamps to local time display
 */

/**
 * Format UTC timestamp to local time string
 * @param {string|Date} utcString - UTC timestamp string or Date object
 * @param {object} options - Formatting options
 * @returns {string} Formatted local time string
 */
export const formatLocalTime = (utcString, options = {}) => {
  if (!utcString) return '—';

  try {
    const date = new Date(utcString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    // Default format: "DD/MM/YYYY, HH:mm" (Vietnamese style)
    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...options
    };

    // If no custom format specified, use DD/MM/YYYY, HH:mm
    if (!options.format) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year}, ${hours}:${minutes}`;
    }

    return date.toLocaleString(undefined, defaultOptions);
  } catch (error) {
    console.error('[DateFormat] Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date in short format (dd/mm/yyyy)
 * @param {string|Date} utcString - UTC timestamp
 * @returns {string}
 */
export const formatDateShort = (utcString) => {
  if (!utcString) return 'N/A';
  try {
    const date = new Date(utcString);
    return date.toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format time only (hh:mm:ss)
 * @param {string|Date} utcString - UTC timestamp
 * @returns {string}
 */
export const formatTimeOnly = (utcString) => {
  if (!utcString) return 'N/A';
  try {
    const date = new Date(utcString);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Calculate duration between two timestamps
 * @param {string|Date} startTime - Start timestamp
 * @param {string|Date} endTime - End timestamp
 * @returns {string} Formatted duration (e.g., "2h 30m 15s")
 */
export const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 'N/A';

  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;

    if (diffMs < 0) return 'Invalid Duration';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  } catch (error) {
    return 'Invalid Duration';
  }
};

/**
 * Get relative time (e.g., "2 hours ago", "vừa xong", "hôm qua")
 * Supports both English and Vietnamese labels
 * @param {string|Date} utcString - UTC timestamp
 * @param {boolean} useVietnamese - Use Vietnamese labels (vừa xong, giờ trước, etc.)
 * @returns {string}
 */
export const formatRelativeTime = (utcString, useVietnamese = false) => {
  if (!utcString) return '';

  try {
    const date = new Date(utcString);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (useVietnamese) {
      if (diffSeconds < 60) {
        return 'vừa xong';
      } else if (diffMinutes < 60) {
        return `${diffMinutes} phút trước`;
      } else if (diffHours < 24) {
        return `${diffHours} giờ trước`;
      } else if (diffDays === 1) {
        return 'hôm qua';
      } else if (diffDays < 7) {
        return `${diffDays} ngày trước`;
      } else {
        return formatDateShort(utcString);
      }
    } else {
      if (diffSeconds < 60) {
        return 'Just now';
      } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else {
        return formatDateShort(utcString);
      }
    }
  } catch (error) {
    return 'Invalid Date';
  }
};


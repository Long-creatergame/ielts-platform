const crypto = require('crypto');

const cache = new Map();
const MAX_CACHE_SIZE = 1000;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(prompt, input) {
  const combined = `${prompt}:${JSON.stringify(input)}`;
  return crypto.createHash('md5').update(combined).digest('hex');
}

function get(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

function set(key, value) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { value, timestamp: Date.now() });
}

async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

module.exports = { getCacheKey, get, set, withRetry };


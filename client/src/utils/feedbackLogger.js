export const logUserAction = (action, metadata = {}) => {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    // eslint-disable-next-line no-console
    console.log(`📊 Demo analytics: ${action}`, metadata);
  } else {
    try {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analytics/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, metadata })
      });
    } catch (_) {}
  }
};



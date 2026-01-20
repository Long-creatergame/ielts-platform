import { useEffect } from 'react';

function isEnabled(value) {
  if (!value) return false;
  const v = String(value).toLowerCase().trim();
  return v === 'true' || v === '1' || v === 'yes';
}

export default function TawkTo() {
  useEffect(() => {
    const enabled = isEnabled(import.meta.env.VITE_TAWK_ENABLED);
    const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID;
    const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID;

    if (!enabled) return;
    if (!propertyId || !widgetId) return;

    if (window.__tawkLoaded) return;
    const existing = document.getElementById('tawkto-script');
    if (existing) {
      window.__tawkLoaded = true;
      return;
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement('script');
    s1.id = 'tawkto-script';
    s1.async = true;
    s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');

    document.body.appendChild(s1);
    window.__tawkLoaded = true;
  }, []);

  return null;
}


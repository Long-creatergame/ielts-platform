import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/overlay.css'

// Initialize Tawk.to chat widget if configured
if (import.meta.env.VITE_DEMO_MODE === 'true') {
  // Demo mode indicator in console only
  // eslint-disable-next-line no-console
  console.log('🎯 IELTS Platform running in DEMO MODE');
}
if (import.meta.env.VITE_TAWK_PROPERTY_ID && import.meta.env.VITE_TAWK_WIDGET_ID) {
  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();
  // Hide default Tawk launcher bubble; we'll control via our own ChatLauncher
  window.Tawk_API.onLoad = function () {
    try {
      if (window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    } catch (_) {}
  };
  (function(){
    var s1 = document.createElement("script");
    var s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = `https://embed.tawk.to/${import.meta.env.VITE_TAWK_PROPERTY_ID}/${import.meta.env.VITE_TAWK_WIDGET_ID}`;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin','*');
    s0.parentNode.insertBefore(s1, s0);
  })();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


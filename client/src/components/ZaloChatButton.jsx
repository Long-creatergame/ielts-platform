import React, { useState } from 'react';

const ZaloChatButton = ({ buttonText = 'Chat với tôi qua Zalo', zaloUrl }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(16);

  // Show button after 5 seconds on page load
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (zaloUrl) {
      window.open(zaloUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Avoid overlapping with Tawk.to widget by raising this button if Tawk is present
  React.useEffect(() => {
    const detectTawk = () => {
      try {
        // Tawk adds an iframe in the bottom-right; if present, lift our button above it
        const tawkIframe = Array.from(document.querySelectorAll('iframe')).find((f) =>
          (f.src || '').includes('tawk.to')
        );
        if (tawkIframe) {
          setBottomOffset(96); // ~ height of Tawk bubble
          return;
        }
        setBottomOffset(16);
      } catch (_) {
        setBottomOffset(16);
      }
    };

    detectTawk();
    const interval = setInterval(detectTawk, 1500);
    window.addEventListener('resize', detectTawk);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', detectTawk);
    };
  }, []);

  if (!zaloUrl || !isVisible) return null;

  return (
    <div className="fixed z-50 animate-fade-in" style={{ right: 16, bottom: bottomOffset }}>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 bg-[#0068FF] hover:bg-[#0052CC] text-white font-bold py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        style={{
          boxShadow: '0 4px 12px rgba(0, 104, 255, 0.4)'
        }}
      >
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.49 1.32 5.02L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm.01 18.33c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a9.42 9.42 0 01-1.26-5.03c0-5.21 4.24-9.45 9.45-9.45 5.21 0 9.45 4.24 9.45 9.45 0 5.21-4.24 9.45-9.45 9.45zm5.18-7.08c-.22-.11-1.3-.64-1.5-.71-.2-.07-.34-.11-.49.11-.14.22-.58.71-.71.86-.14.15-.28.17-.52.06-.24-.11-1-.37-1.91-1.18-.7-.63-1.18-1.4-1.32-1.64-.14-.24-.01-.37.1-.49.11-.11.24-.29.37-.44.12-.15.17-.25.26-.41.08-.17.05-.32-.02-.44-.08-.13-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51-.18 0-.38-.01-.58-.01s-.53.08-.81.38c-.28.31-1.07 1.05-1.07 2.56 0 1.51 1.1 2.97 1.25 3.18.15.2 2.16 3.29 5.27 4.62.74.31 1.33.5 1.78.64.75.23 1.43.2 1.97.12.6-.09 1.84-.75 2.1-1.48.26-.73.26-1.36.18-1.49-.08-.13-.3-.2-.52-.31z" />
        </svg>
        <span className="hidden sm:inline">{buttonText}</span>
        <span className="sm:hidden">Zalo</span>
      </button>
    </div>
  );
};

export default ZaloChatButton;


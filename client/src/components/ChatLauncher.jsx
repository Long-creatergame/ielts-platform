import React, { useEffect, useState } from 'react';

export default function ChatLauncher({ zaloUrl }) {
  const [open, setOpen] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(16);
  const [rightOffset, setRightOffset] = useState(16);

  useEffect(() => {
    const detectTawk = () => {
      try {
        const tawkIframe = Array.from(document.querySelectorAll('iframe')).find((f) =>
          (f.src || '').includes('tawk.to')
        );
        setBottomOffset(tawkIframe ? 96 : 16);
        setRightOffset(tawkIframe ? 72 : 16); // push left if Tawk bubble exists
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

  const toggleTawk = () => {
    try {
      if (window.Tawk_API) {
        if (window.Tawk_API.showWidget) window.Tawk_API.showWidget();
        if (window.Tawk_API.maximize) {
          window.Tawk_API.maximize();
        } else if (window.Tawk_API.toggle) {
          window.Tawk_API.toggle();
        }
      }
    } catch (_) {}
  };

  const minimizeTawk = () => {
    try {
      if (window.Tawk_API && window.Tawk_API.minimize) {
        window.Tawk_API.minimize();
      }
    } catch (_) {}
  };

  const openZalo = () => {
    if (zaloUrl) window.open(zaloUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed z-50"
      style={{ right: rightOffset, bottom: bottomOffset }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Actions panel */}
      <div
        className={`flex flex-col items-end mb-3 space-y-2 transition-all duration-200 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-1'}`}
      >
        <button
          onClick={toggleTawk}
          title="Live chat"
          className="w-10 h-10 rounded-full bg-white text-gray-800 shadow-lg hover:shadow-xl grid place-items-center border border-gray-200"
        >
          <span className="text-green-500 text-lg">•</span>
        </button>
        <button
          onClick={openZalo}
          title="Zalo"
          className="w-10 h-10 rounded-full bg-[#0068FF] hover:bg-[#0052CC] text-white shadow-lg hover:shadow-xl grid place-items-center"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.49 1.32 5.02L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm.01 18.33c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a9.42 9.42 0 01-1.26-5.03c0-5.21 4.24-9.45 9.45-9.45 5.21 0 9.45 4.24 9.45 9.45 0 5.21-4.24 9.45-9.45 9.45z"/></svg>
        </button>
        <button
          onClick={minimizeTawk}
          title="Thu nhỏ chat"
          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 shadow grid place-items-center"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
      </div>

      {/* Main launcher button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Support channels"
        className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl grid place-items-center"
      >
        {open ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h8M8 14h6M21 12c0 4.418-4.477 8-10 8a11.82 11.82 0 01-4-.7L3 20l.7-3.7A8.7 8.7 0 013 12c0-4.418 4.477-8 10-8s10 3.582 10 8z"/></svg>
        )}
      </button>
    </div>
  );
}



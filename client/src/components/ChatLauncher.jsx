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
          className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl grid place-items-center"
          aria-label="Live chat"
        >
          {/* Chat bubble icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C6.477 3 2 6.686 2 11c0 1.96.81 3.77 2.17 5.2L3 21l4.02-1.13C8.24 20.6 10.06 21 12 21c5.523 0 10-3.686 10-8s-4.477-8-10-8z"/>
          </svg>
        </button>
        <button
          onClick={openZalo}
          title="Zalo"
          className="w-10 h-10 rounded-full bg-[#0068FF] hover:bg-[#0052CC] text-white shadow-lg hover:shadow-xl grid place-items-center"
          aria-label="Zalo"
        >
          {/* Zalo 'Z' in speech bubble */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M4 3h16a1 1 0 011 1v10a1 1 0 01-1 1h-6l-3.5 3.5c-.63.63-1.5.18-1.5-.7V15H4a1 1 0 01-1-1V4a1 1 0 011-1z"/>
            <path d="M15.5 7h-5.7v1.6h3.5l-3.6 3.8V14H16v-1.6h-3.7l3.2-3.5V7z" fill="#fff"/>
          </svg>
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



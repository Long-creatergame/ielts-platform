import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function HelpPopover({ title = "How to use AI Practice?", content }) {
  const [open, setOpen] = useState(false);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const defaultContent = (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-[#35b86d] mb-3">{title}</h3>
      <ol className="list-decimal pl-6 text-gray-700 space-y-2">
        <li>Click <strong>Quick Start</strong> on dashboard.</li>
        <li>Choose <strong>Full Test</strong> or specific skill.</li>
        <li>Complete 4 skills: Reading, Writing, Listening, Speaking.</li>
        <li>View results and get personalized advice from AI.</li>
      </ol>
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Complete tests regularly to track your progress and get better AI recommendations.
        </p>
      </div>
    </div>
  );

  const overlayContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
      style={{
        WebkitBackdropFilter: 'blur(4px)', // iOS Safari support
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] p-6 animate-fadeIn relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {content || defaultContent}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          onClick={() => setOpen(false)}
          aria-label="Close help"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  const overlayRoot = document.getElementById('overlay-root');

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-[#35b86d] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2ea25f] transition-colors shadow-sm flex items-center space-x-2"
        aria-label="Show help"
      >
        <span>❓</span>
        <span>Help</span>
      </button>
      {open && overlayRoot && createPortal(overlayContent, overlayRoot)}
    </>
  );
}


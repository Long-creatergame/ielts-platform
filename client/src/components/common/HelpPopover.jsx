import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

export default function HelpPopover({ currentTab = "overview", title, content }) {
  const { t } = useTranslation();
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

  // Get contextual help content based on current tab using i18n
  const getHelpTitle = () => {
    if (title) return title;
    return t(`help.popover.${currentTab}.title`, { defaultValue: t('help.popover.overview.title') });
  };

  const getHelpSteps = () => {
    const steps = [];
    for (let i = 1; i <= 4; i++) {
      const stepKey = `help.popover.${currentTab}.step${i}`;
      const step = t(stepKey);
      if (step && step !== stepKey) { // Only add if translation exists
        steps.push(step);
      }
    }
    return steps;
  };

  // Use custom content if provided, otherwise use contextual help from i18n
  const displayContent = content || (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-[#35b86d] mb-4">
        {getHelpTitle()}
      </h3>
      <ol className="list-decimal pl-5 text-gray-700 space-y-2 text-sm">
        {getHelpSteps().map((step, i) => (
          <li key={i} className="leading-relaxed">{step}</li>
        ))}
      </ol>
      <div className="mt-4 p-3 bg-[#35b86d]/10 rounded-lg border border-[#35b86d]/20">
        <p className="text-sm text-gray-700">
          💡 <strong>{t('common.help', { defaultValue: 'Tip' })}:</strong> {t('help.popover.tip')}
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-6 animate-fadeIn relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {displayContent}
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
        className="bg-[#35b86d] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#2ea25f] transition-colors shadow-sm flex items-center gap-1"
        aria-label="Show help"
      >
        <span>❓</span>
        <span>{t('common.help', 'Help')}</span>
      </button>
      {open && overlayRoot && createPortal(overlayContent, overlayRoot)}
    </>
  );
}


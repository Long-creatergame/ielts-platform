import React, { useState, useEffect, useRef } from 'react';

const TutorialTooltip = ({ 
  children, 
  title, 
  content, 
  position = 'top',
  show = false,
  onNext,
  onClose,
  step,
  totalSteps
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const tooltipRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (isVisible && targetRef.current) {
      // Scroll to target element
      targetRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [isVisible]);

  if (!isVisible) {
    return <div ref={targetRef}>{children}</div>;
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      case 'top-left':
        return 'bottom-full left-0 mb-2';
      case 'top-right':
        return 'bottom-full right-0 mb-2';
      case 'bottom-left':
        return 'top-full left-0 mt-2';
      case 'bottom-right':
        return 'top-full right-0 mt-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-blue-500';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-blue-500';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-blue-500';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-blue-500';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-blue-500';
    }
  };

  return (
    <div className="relative" ref={targetRef}>
      {/* Highlight overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"></div>
      
      {/* Target element highlight */}
      <div className="relative z-50">
        {children}
      </div>

      {/* Tooltip */}
      <div 
        ref={tooltipRef}
        className={`absolute z-50 ${getPositionClasses()}`}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-80 p-6 border border-gray-200">
          {/* Arrow */}
          <div className={`absolute w-0 h-0 border-4 border-transparent ${getArrowClasses()}`}></div>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-600 mb-6 leading-relaxed">{content}</p>

          {/* Progress */}
          {step && totalSteps && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Bước {step} / {totalSteps}</span>
                <span>{Math.round((step / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Bỏ qua
            </button>
            {onNext && (
              <button
                onClick={onNext}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Tiếp theo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialTooltip;

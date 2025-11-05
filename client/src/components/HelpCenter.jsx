import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const HelpCenter = ({ isOpen, onClose }) => {
  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('getting-started');

  const helpCategories = {
    'getting-started': {
      title: t('help.gettingStarted'),
      icon: '🚀',
      color: 'from-blue-500 to-blue-600',
      articles: [
        {
          title: t('help.articles.howToStart.title'),
          content: t('help.articles.howToStart.content'),
          steps: [
            t('help.articles.howToStart.step1'),
            t('help.articles.howToStart.step2'),
            t('help.articles.howToStart.step3'),
            t('help.articles.howToStart.step4')
          ]
        },
        {
          title: t('help.articles.aiPractice.title'),
          content: t('help.articles.aiPractice.content'),
          steps: [
            t('help.articles.aiPractice.step1'),
            t('help.articles.aiPractice.step2'),
            t('help.articles.aiPractice.step3'),
            t('help.articles.aiPractice.step4'),
            t('help.articles.aiPractice.step5')
          ]
        },
        {
          title: t('help.articles.scoring.title'),
          content: t('help.articles.scoring.content'),
          steps: [
            t('help.articles.scoring.step1'),
            t('help.articles.scoring.step2'),
            t('help.articles.scoring.step3'),
            t('help.articles.scoring.step4')
          ]
        }
      ]
    },
    'features': {
      title: t('help.features'),
      icon: '⚙️',
      color: 'from-purple-500 to-purple-600',
      articles: [
        {
          title: t('help.articles.dashboard.title'),
          content: t('help.articles.dashboard.content'),
          features: [
            t('help.articles.dashboard.feature1'),
            t('help.articles.dashboard.feature2'),
            t('help.articles.dashboard.feature3'),
            t('help.articles.dashboard.feature4')
          ]
        },
        {
          title: t('help.articles.aiPracticeFeature.title'),
          content: t('help.articles.aiPracticeFeature.content'),
          features: [
            t('help.articles.aiPracticeFeature.feature1'),
            t('help.articles.aiPracticeFeature.feature2'),
            t('help.articles.aiPracticeFeature.feature3'),
            t('help.articles.aiPracticeFeature.feature4')
          ]
        },
        {
          title: t('help.articles.weaknessAnalysis.title'),
          content: t('help.articles.weaknessAnalysis.content'),
          features: [
            t('help.articles.weaknessAnalysis.feature1'),
            t('help.articles.weaknessAnalysis.feature2'),
            t('help.articles.weaknessAnalysis.feature3'),
            t('help.articles.weaknessAnalysis.feature4')
          ]
        }
      ]
    },
    'troubleshooting': {
      title: t('help.troubleshooting'),
      icon: '🔧',
      color: 'from-red-500 to-red-600',
      articles: [
        {
          title: t('help.articles.submitIssue.title'),
          content: t('help.articles.submitIssue.content'),
          solutions: [
            t('help.articles.submitIssue.solution1'),
            t('help.articles.submitIssue.solution2'),
            t('help.articles.submitIssue.solution3'),
            t('help.articles.submitIssue.solution4')
          ]
        },
        {
          title: t('help.articles.aiIssue.title'),
          content: t('help.articles.aiIssue.content'),
          solutions: [
            t('help.articles.aiIssue.solution1'),
            t('help.articles.aiIssue.solution2'),
            t('help.articles.aiIssue.solution3')
          ]
        },
        {
          title: t('help.articles.saveIssue.title'),
          content: t('help.articles.saveIssue.content'),
          solutions: [
            t('help.articles.saveIssue.solution1'),
            t('help.articles.saveIssue.solution2'),
            t('help.articles.saveIssue.solution3')
          ]
        }
      ]
    }
  };

  const currentCategory = helpCategories[activeCategory];

  const overlayContent = (
    <div 
      className={`fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{
        WebkitBackdropFilter: 'blur(4px)', // iOS Safari support
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">📚 {t('help.title')}</h2>
              <p className="text-blue-100">{t('help.subtitle')}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-4">{t('help.categories')}</h3>
            <div className="space-y-2">
              {Object.entries(helpCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    activeCategory === key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium">{category.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${currentCategory.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                  {currentCategory.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{currentCategory.title}</h3>
              </div>
            </div>

            <div className="space-y-6">
              {currentCategory.articles.map((article, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">{article.title}</h4>
                  <p className="text-gray-600 mb-4 leading-relaxed">{article.content}</p>
                  
                  {article.steps && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h5 className="font-semibold text-blue-900 mb-3">{t('help.steps')}</h5>
                      <ol className="space-y-2">
                        {article.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start space-x-3">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                              {stepIndex + 1}
                            </span>
                            <span className="text-blue-800">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {article.features && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <h5 className="font-semibold text-green-900 mb-3">{t('help.keyFeatures')}</h5>
                      <ul className="space-y-2">
                        {article.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              ✓
                            </span>
                            <span className="text-green-800">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {article.solutions && (
                    <div className="bg-orange-50 rounded-xl p-4">
                      <h5 className="font-semibold text-orange-900 mb-3">{t('help.solutions')}</h5>
                      <ul className="space-y-2">
                        {article.solutions.map((solution, solutionIndex) => (
                          <li key={solutionIndex} className="flex items-start space-x-3">
                            <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              !
                            </span>
                            <span className="text-orange-800">{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const overlayRoot = document.getElementById('overlay-root');

  if (!isOpen || !overlayRoot) return null;

  return createPortal(overlayContent, overlayRoot);
};

export default HelpCenter;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Overview from '../components/dashboard/Overview';
import Skills from '../components/dashboard/Skills';
import Insights from '../components/dashboard/Insights';
import Path from '../components/dashboard/Path';
import History from '../components/dashboard/History';
import HelpPopover from '../components/common/HelpPopover';

export default function DashboardUnified() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: t('dashboard.unified.overview'), icon: '🧭' },
    { id: 'skills', label: t('dashboard.unified.skills'), icon: '🧩' },
    { id: 'insights', label: t('dashboard.unified.insights'), icon: '💡' },
    { id: 'path', label: t('dashboard.unified.path'), icon: '📈' },
    { id: 'history', label: t('dashboard.unified.history'), icon: '📜' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header with Help Button */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">{t('dashboard.unified.title')}</h1>
          <div className="flex items-center space-x-3">
            <HelpPopover currentTab={activeTab} />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 px-6 py-4 text-center font-medium transition-all duration-200 relative
                  ${activeTab === tab.id
                    ? 'text-white bg-gradient-to-r from-[#35b86d] to-[#a1e3b3]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                title={tab.label}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.icon}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'skills' && <Skills />}
          {activeTab === 'insights' && <Insights />}
          {activeTab === 'path' && <Path />}
          {activeTab === 'history' && <History />}
        </div>
      </div>

      {/* Add CSS for fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}


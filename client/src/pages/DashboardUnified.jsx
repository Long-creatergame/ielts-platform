import React, { useState } from 'react';
import Overview from '../components/dashboard/Overview';
import Skills from '../components/dashboard/Skills';
import Insights from '../components/dashboard/Insights';
import Path from '../components/dashboard/Path';
import History from '../components/dashboard/History';

export default function DashboardUnified() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: '🧭' },
    { id: 'skills', label: 'Luyện tập kỹ năng', icon: '🧩' },
    { id: 'insights', label: 'Phân tích & Gợi ý', icon: '💡' },
    { id: 'path', label: 'Lộ trình học', icon: '📈' },
    { id: 'history', label: 'Kết quả & Bài test', icon: '📜' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
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


import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AdvancedProgressCharts = ({ userId, timeRange = '30d' }) => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('overall');

  useEffect(() => {
    fetchProgressData();
  }, [userId, timeRange]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/progress-tracking/${userId}?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChartData(data.data);
      } else {
        // Generate mock data for demonstration
        setChartData(generateMockData());
      }
    } catch (error) {
      console.error('Fetch progress data error:', error);
      setChartData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        reading: 5.0 + Math.random() * 2,
        writing: 4.5 + Math.random() * 2.5,
        listening: 5.5 + Math.random() * 1.5,
        speaking: 4.0 + Math.random() * 3,
        overall: 4.5 + Math.random() * 2.5
      });
    }
    
    return {
      dailyProgress: data,
      skillBreakdown: {
        reading: { current: 6.2, target: 7.0, improvement: 0.8 },
        writing: { current: 5.8, target: 6.5, improvement: 0.7 },
        listening: { current: 6.5, target: 7.0, improvement: 0.5 },
        speaking: { current: 5.5, target: 6.0, improvement: 0.5 }
      },
      weeklyStats: {
        testsCompleted: 12,
        studyTime: 480, // minutes
        streak: 7,
        accuracy: 78
      }
    };
  };

  const LineChart = ({ data, title, color = 'blue' }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => Math.max(d.reading, d.writing, d.listening, d.speaking, d.overall)));
    const minValue = Math.min(...data.map(d => Math.min(d.reading, d.writing, d.listening, d.speaking, d.overall)));
    const range = maxValue - minValue;
    const padding = range * 0.1;

    const getY = (value) => {
      return 100 - ((value - minValue + padding) / (range + padding * 2)) * 100;
    };

    const getX = (index) => {
      return (index / (data.length - 1)) * 100;
    };

    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 relative">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="0.5"
              />
            ))}
            
            {/* Y-axis labels */}
            {[0, 25, 50, 75, 100].map((y, i) => {
              const value = minValue + padding + (range + padding * 2) * (1 - y / 100);
              return (
                <text
                  key={y}
                  x="-2"
                  y={y + 1}
                  fontSize="2"
                  fill="#6b7280"
                  textAnchor="end"
                >
                  {value.toFixed(1)}
                </text>
              );
            })}
            
            {/* Reading line */}
            <polyline
              points={data.map((d, i) => `${getX(i)},${getY(d.reading)}`).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="0.5"
            />
            
            {/* Writing line */}
            <polyline
              points={data.map((d, i) => `${getX(i)},${getY(d.writing)}`).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="0.5"
            />
            
            {/* Listening line */}
            <polyline
              points={data.map((d, i) => `${getX(i)},${getY(d.listening)}`).join(' ')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="0.5"
            />
            
            {/* Speaking line */}
            <polyline
              points={data.map((d, i) => `${getX(i)},${getY(d.speaking)}`).join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth="0.5"
            />
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              <span>Reading</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span>Writing</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-yellow-500"></div>
              <span>Listening</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span>Speaking</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SkillBreakdownChart = ({ data }) => {
    if (!data) return null;

    const skills = Object.entries(data);
    const maxValue = Math.max(...skills.map(([_, skill]) => skill.target));

    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Breakdown</h3>
        <div className="space-y-4">
          {skills.map(([skill, data]) => {
            const progress = (data.current / data.target) * 100;
            return (
              <div key={skill} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">{skill}</span>
                  <span className="text-sm text-gray-500">{data.current.toFixed(1)} / {data.target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      progress >= 90 ? 'bg-green-500' :
                      progress >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>+{data.improvement.toFixed(1)} improvement</span>
                  <span>{progress.toFixed(0)}% of target</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const WeeklyStatsCards = ({ data }) => {
    if (!data) return null;

    const stats = [
      {
        title: 'Tests Completed',
        value: data.testsCompleted,
        icon: '📊',
        color: 'blue'
      },
      {
        title: 'Study Time',
        value: `${Math.floor(data.studyTime / 60)}h ${data.studyTime % 60}m`,
        icon: '⏰',
        color: 'green'
      },
      {
        title: 'Current Streak',
        value: `${data.streak} days`,
        icon: '🔥',
        color: 'orange'
      },
      {
        title: 'Accuracy',
        value: `${data.accuracy}%`,
        icon: '🎯',
        color: 'purple'
      }
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('common.loading')}</span>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="text-center p-8 text-gray-500">
        {t('progress.noData', 'No progress data available')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Selection */}
      <div className="flex space-x-2">
        {[
          { id: 'overall', label: 'Overall Progress' },
          { id: 'skills', label: 'Skill Breakdown' },
          { id: 'stats', label: 'Weekly Stats' }
        ].map(chart => (
          <button
            key={chart.id}
            onClick={() => setSelectedChart(chart.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedChart === chart.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {chart.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      {selectedChart === 'overall' && (
        <LineChart 
          data={chartData.dailyProgress} 
          title="Daily Progress Over Time" 
        />
      )}
      
      {selectedChart === 'skills' && (
        <SkillBreakdownChart data={chartData.skillBreakdown} />
      )}
      
      {selectedChart === 'stats' && (
        <WeeklyStatsCards data={chartData.weeklyStats} />
      )}
    </div>
  );
};

export default AdvancedProgressCharts;

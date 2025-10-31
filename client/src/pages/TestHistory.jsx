import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function TestHistory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all', // all, reading, writing, listening, speaking, full-test, quick-practice
    dateRange: 'all', // all, today, week, month, year
    scoreRange: 'all', // all, high, medium, low
    sortBy: 'date' // date, score, type
  });

  useEffect(() => {
    loadTestHistory();
  }, [user?.id]);

  useEffect(() => {
    applyFilters();
  }, [tests, filters]);

  const loadTestHistory = async () => {
    try {
      setLoading(true);
      
      // Try to load tests from MongoDB first
      let savedTests = [];
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        const token = localStorage.getItem('token');
        
        // Only fetch from MongoDB if we have a token and user
        if (token && user) {
          console.log('🔄 Fetching tests from MongoDB for user:', user.id);
          const response = await fetch(`${API_BASE_URL}/api/tests/mine`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            // Transform MongoDB test format to match expected format
            savedTests = (data.tests || []).map(test => ({
              id: test._id || test.id,
              testType: 'IELTS Academic',
              level: test.level || 'A2',
              date: test.dateTaken || test.createdAt || new Date().toISOString(),
              overallScore: test.totalBand || test.overallBand || 0,
              skill: 'full',
              status: test.completed ? 'completed' : 'in-progress',
              details: { skillScores: test.skillBands || {} }
            }));
            console.log('✅ Loaded tests from MongoDB:', savedTests.length);
          } else {
            console.log('⚠️ MongoDB response not ok:', response.status);
          }
        } else {
          console.log('⚠️ No token or user, skipping MongoDB fetch');
        }
      } catch (error) {
        console.log('⚠️ MongoDB load failed, using localStorage:', error.message);
      }
      
      // Fallback to localStorage if MongoDB fails or empty
      if (savedTests.length === 0) {
        const localStorageTests = JSON.parse(localStorage.getItem('testHistory') || '[]');
        const sessionStorageTests = JSON.parse(sessionStorage.getItem('testHistory') || '[]');
        savedTests = localStorageTests.length > 0 ? localStorageTests : sessionStorageTests;
        console.log('📦 Using localStorage tests:', savedTests.length);
      }
      
      // Load milestones
      const milestones = JSON.parse(localStorage.getItem('milestones') || '[]');
      
      // Load daily challenges
      const dailyChallenges = JSON.parse(localStorage.getItem('dailyChallenges') || '[]');
      
      // Combine all activities
      const allActivities = [];
      
      // Add test activities
      savedTests.forEach(test => {
        allActivities.push({
          id: test.id || Date.now() + Math.random(),
          type: 'test',
          testType: test.testType || 'IELTS Test',
          skill: test.skill || 'full',
          score: test.overallScore || test.bandScore || 0,
          date: test.date || test.dateTaken || new Date().toISOString(),
          duration: test.duration || 0,
          status: test.status || 'completed',
          details: test.details || {}
        });
      });
      
      // Add milestone activities
      milestones.forEach(milestone => {
        allActivities.push({
          id: milestone.id || Date.now() + Math.random(),
          type: 'milestone',
          testType: 'Achievement',
          skill: 'milestone',
          score: null,
          date: milestone.date || new Date().toISOString(),
          duration: 0,
          status: 'completed',
          details: {
            name: milestone.name,
            description: milestone.description
          }
        });
      });
      
      // Add daily challenge activities
      dailyChallenges.forEach(challenge => {
        allActivities.push({
          id: challenge.id || Date.now() + Math.random(),
          type: 'challenge',
          testType: 'Daily Challenge',
          skill: challenge.skill || 'mixed',
          score: challenge.score || null,
          date: challenge.date || new Date().toISOString(),
          duration: challenge.duration || 0,
          status: 'completed',
          details: {
            streak: challenge.streak,
            description: challenge.description
          }
        });
      });
      
      // Sort by date (most recent first)
      allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setTests(allActivities);
    } catch (error) {
      console.error('Error loading test history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tests];

    // Filter by type
    if (filters.type !== 'all') {
      if (filters.type === 'full-test') {
        filtered = filtered.filter(test => test.testType === 'IELTS Test' && test.skill === 'full');
      } else if (filters.type === 'quick-practice') {
        filtered = filtered.filter(test => test.testType === 'Quick Practice');
      } else if (filters.type === 'milestone') {
        filtered = filtered.filter(test => test.type === 'milestone');
      } else if (filters.type === 'challenge') {
        filtered = filtered.filter(test => test.type === 'challenge');
      } else {
        filtered = filtered.filter(test => test.skill === filters.type);
      }
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(test => new Date(test.date) >= filterDate);
    }

    // Filter by score range
    if (filters.scoreRange !== 'all' && filters.type !== 'milestone' && filters.type !== 'challenge') {
      filtered = filtered.filter(test => {
        if (!test.score) return false;
        switch (filters.scoreRange) {
          case 'high':
            return test.score >= 7.0;
          case 'medium':
            return test.score >= 5.0 && test.score < 7.0;
          case 'low':
            return test.score < 5.0;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'score':
          return (b.score || 0) - (a.score || 0);
        case 'type':
          return a.testType.localeCompare(b.testType);
        case 'date':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    setFilteredTests(filtered);
  };

  const getTestIcon = (test) => {
    if (test.type === 'milestone') return '🏆';
    if (test.type === 'challenge') return '🔥';
    
    const skillIcons = {
      reading: '📖',
      writing: '✍️',
      listening: '🎧',
      speaking: '🎤',
      full: '📝',
      mixed: '🎯'
    };
    return skillIcons[test.skill] || '📚';
  };

  const getTestColor = (test) => {
    if (test.type === 'milestone') return 'from-yellow-500 to-orange-500';
    if (test.type === 'challenge') return 'from-orange-500 to-red-500';
    
    const skillColors = {
      reading: 'from-blue-500 to-blue-600',
      writing: 'from-green-500 to-green-600',
      listening: 'from-purple-500 to-purple-600',
      speaking: 'from-orange-500 to-orange-600',
      full: 'from-indigo-500 to-indigo-600',
      mixed: 'from-pink-500 to-pink-600'
    };
    return skillColors[test.skill] || 'from-gray-500 to-gray-600';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return t('common.yesterday');
    if (diffDays < 7) return t('common.daysAgo', { count: diffDays });
    if (diffDays < 30) return t('common.weeksAgo', { count: Math.ceil(diffDays / 7) });
    if (diffDays < 365) return t('common.monthsAgo', { count: Math.ceil(diffDays / 30) });
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 {t('testHistory.title')}</h1>
          <p className="text-gray-600">{t('testHistory.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 {t('testHistory.filters')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Test Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại bài kiểm tra</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="full-test">Bài thi đầy đủ</option>
                <option value="quick-practice">Luyện tập nhanh</option>
                <option value="reading">Reading</option>
                <option value="writing">Writing</option>
                <option value="listening">Listening</option>
                <option value="speaking">Speaking</option>
                <option value="milestone">Thành tích</option>
                <option value="challenge">Thử thách</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng thời gian</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="today">Hôm nay</option>
                <option value="week">7 ngày qua</option>
                <option value="month">1 tháng qua</option>
                <option value="year">1 năm qua</option>
              </select>
            </div>

            {/* Score Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Điểm số</label>
              <select
                value={filters.scoreRange}
                onChange={(e) => setFilters({...filters, scoreRange: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={filters.type === 'milestone' || filters.type === 'challenge'}
              >
                <option value="all">Tất cả</option>
                <option value="high">7.0+ (Cao)</option>
                <option value="medium">5.0-6.9 (Trung bình)</option>
                <option value="low">Dưới 5.0 (Thấp)</option>
              </select>
            </div>

            {/* Sort By Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp theo</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Ngày (mới nhất)</option>
                <option value="score">Điểm số (cao nhất)</option>
                <option value="type">Loại bài kiểm tra</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({
                type: 'all',
                dateRange: 'all',
                scoreRange: 'all',
                sortBy: 'date'
              })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Kết quả ({filteredTests.length} bài kiểm tra)
            </h2>
            <div className="text-sm text-gray-500">
              Hiển thị {filteredTests.length} trong tổng số {tests.length} hoạt động
            </div>
          </div>

          {filteredTests.length > 0 ? (
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 rounded-xl p-6 border border-gray-200 hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getTestColor(test)} rounded-xl flex items-center justify-center text-white text-xl`}>
                        {getTestIcon(test)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {test.testType}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{formatDate(test.date)}</span>
                          {test.duration > 0 && (
                            <span>⏱️ {test.duration} phút</span>
                          )}
                          {test.details?.streak && (
                            <span>🔥 {test.details.streak} ngày</span>
                          )}
                        </div>
                        {test.details?.description && (
                          <p className="text-sm text-gray-500 mt-1">{test.details.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {test.score !== null && (
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {test.score}
                        </div>
                        <div className="text-sm text-gray-600">Band Score</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có kết quả</h3>
              <p className="text-gray-600 mb-6">
                Không tìm thấy bài kiểm tra nào phù hợp với bộ lọc của bạn
              </p>
              <button
                onClick={() => setFilters({
                  type: 'all',
                  dateRange: 'all',
                  scoreRange: 'all',
                  sortBy: 'date'
                })}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
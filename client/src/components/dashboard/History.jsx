import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { formatLocalTime, formatRelativeTime } from '../../utils/dateFormat';
import Loader from '../Loader';

export default function History() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      if (!token || !user) return;

      // Fetch from both endpoints
      const [testsRes, sessionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/tests/mine`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }).catch(() => null),
        fetch(`${API_BASE_URL}/api/exam/recent`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }).catch(() => null)
      ]);

      const testsData = testsRes?.ok ? await testsRes.json() : { data: [] };
      const sessionsData = sessionsRes?.ok ? await sessionsRes.json() : [];

      // Combine and deduplicate
      const allTests = [
        ...(testsData.data || testsData.tests || []),
        ...(Array.isArray(sessionsData) ? sessionsData : [])
      ];

      // Sort by date (most recent first)
      allTests.sort((a, b) => {
        const dateA = new Date(a.dateTaken || a.endTime || a.createdAt || 0);
        const dateB = new Date(b.dateTaken || b.endTime || b.createdAt || 0);
        return dateB - dateA;
      });

      setTests(allTests);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const handleViewResult = (test) => {
    if (test._id) {
      navigate(`/test/result/${test._id}`);
    } else if (test.sessionId) {
      navigate(`/review/${test.sessionId}`);
    } else {
      // Save to localStorage for TestResult to load
      localStorage.setItem('latestTestResult', JSON.stringify(test));
      navigate('/test/result');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{t('dashboard.unified.history')}</h1>
        <p className="text-white/90">{t('history.subtitle', 'View all your test results and AI feedback')}</p>
      </div>

      {/* Tests List */}
      {tests.length > 0 ? (
        <div className="space-y-4">
          {tests.map((test, index) => {
            const testDate = test.dateTaken || test.endTime || test.createdAt;
            const bandScore = test.totalBand || test.overallBand || test.bandScore || 0;
            const skill = test.skill || 'full';

            return (
              <div
                key={test._id || test.sessionId || index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-indigo-200"
                onClick={() => handleViewResult(test)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">
                        {skill === 'reading' ? '📖' : 
                         skill === 'listening' ? '🎧' :
                         skill === 'writing' ? '✍️' :
                         skill === 'speaking' ? '🎤' : '📝'}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {t(`test.skill.${skill}`, `IELTS ${skill.charAt(0).toUpperCase() + skill.slice(1)}`)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          🕒 {formatRelativeTime(testDate, i18n.language)}
                          <span className="ml-2">({formatLocalTime(testDate)})</span>
                        </p>
                      </div>
                    </div>
                    {test.skillBands && (
                      <div className="flex space-x-4 text-sm text-gray-600">
                        {Object.entries(test.skillBands).map(([skill, band]) => (
                          <span key={skill}>
                            {skill}: <strong>{band?.toFixed(1) || 'N/A'}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-indigo-600">
                      {bandScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">{t('common.band', 'Band')}</div>
                    <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                      {t('test.viewDetail', 'View Detail')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('history.noTests', 'No tests yet')}</h3>
          <p className="text-gray-600 mb-6">{t('history.noTestsDesc', 'Start your first test to see results here')}</p>
          <button
            onClick={() => navigate('/test/start')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            {t('dashboard.startTest', 'Start Test')}
          </button>
        </div>
      )}
    </div>
  );
}


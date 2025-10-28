import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function WeeklyReport() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/weekly-report/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReport(data.data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tạo báo cáo tuần...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">📊 Báo cáo tuần</h3>
          <p className="text-gray-600 mb-4">Chưa có dữ liệu để tạo báo cáo</p>
          <button
            onClick={generateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Tạo báo cáo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">📊 Báo cáo tuần</h3>
        <button
          onClick={generateReport}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Làm mới
        </button>
      </div>

      {/* Week Period */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">📅 Tuần từ {report.week.start} đến {report.week.end}</h4>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{report.metrics.totalTests}</div>
          <div className="text-sm text-green-800">Bài test hoàn thành</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{report.metrics.averageScore}</div>
          <div className="text-sm text-blue-800">Điểm trung bình</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Object.keys(report.metrics.skillScores).length}
          </div>
          <div className="text-sm text-purple-800">Kỹ năng đã luyện</div>
        </div>
      </div>

      {/* Skill Breakdown */}
      {Object.keys(report.metrics.skillScores).length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">🎯 Điểm theo kỹ năng</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(report.metrics.skillScores).map(([skill, score]) => (
              <div key={skill} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900">{score}</div>
                <div className="text-sm text-gray-600 capitalize">{skill}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {report.insights.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">💡 Nhận xét</h4>
          <div className="space-y-2">
            {report.insights.map((insight, index) => (
              <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                <p className="text-yellow-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">🚀 Gợi ý cải thiện</h4>
          <div className="space-y-2">
            {report.recommendations.map((rec, index) => (
              <div key={index} className="bg-green-50 border-l-4 border-green-400 p-3">
                <p className="text-green-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 text-center">
        <h4 className="font-semibold text-gray-900 mb-2">🎯 Tiếp tục luyện tập!</h4>
        <p className="text-gray-600 text-sm mb-3">
          Làm thêm bài test để cải thiện kỹ năng và nhận báo cáo chi tiết hơn
        </p>
        <button
          onClick={() => window.location.href = '/test/start'}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200"
        >
          Làm bài test ngay
        </button>
      </div>
    </div>
  );
}

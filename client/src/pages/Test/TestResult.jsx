import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ScoreCard from '../../components/ScoreCard';
import CoachMessage from '../../components/CoachMessage';
import ProgressRing from '../../components/ProgressRing';

export default function TestResult() {
  const { id } = useParams();
  const { user } = useAuth();

  // Mock test result data - in real app, this would be fetched from API
  const testResult = {
    _id: id,
    totalBand: 7.5,
    skillBands: {
      reading: 8.0,
      listening: 7.5,
      writing: 7.0,
      speaking: 7.5
    },
    dateTaken: new Date(),
    coachMessage: `🎉 Xuất sắc ${user?.name}! Bạn đã đạt Band ${7.5} - gần với mục tiêu ${user?.targetBand} rồi!`,
    recommendations: [
      'Tập trung cải thiện Writing - hiện tại Band 7.0',
      'Duy trì phong độ Reading và Listening',
      'Luyện tập Speaking thêm để đạt Band 8.0'
    ]
  };

  const getSkillColor = (skill) => {
    const colors = {
      reading: 'blue',
      listening: 'green', 
      writing: 'purple',
      speaking: 'orange'
    };
    return colors[skill] || 'blue';
  };

  const getSkillName = (skill) => {
    const names = {
      reading: 'Reading',
      listening: 'Listening',
      writing: 'Writing',
      speaking: 'Speaking'
    };
    return names[skill] || skill;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎉 Test Complete!
          </h1>
          <p className="text-lg text-gray-600">
            Congratulations on completing your IELTS practice test!
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Overall Band Score</h2>
          <ProgressRing
            current={testResult.totalBand}
            target={user?.targetBand || 8.0}
            size={200}
          />
          <div className="mt-6">
            <p className="text-4xl font-bold text-blue-600 mb-2">{testResult.totalBand}</p>
            <p className="text-lg text-gray-600">Overall Band</p>
          </div>
        </div>

        {/* Coach Message */}
        <div className="mb-8">
          <CoachMessage 
            message={testResult.coachMessage} 
            type="success"
          />
        </div>

        {/* Skill Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Skill Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(testResult.skillBands).map(([skill, band]) => (
              <ScoreCard
                key={skill}
                title={getSkillName(skill)}
                score={band}
                color={getSkillColor(skill)}
              />
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {testResult.recommendations && testResult.recommendations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">💡 Recommendations</h2>
            <div className="space-y-3">
              {testResult.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 mr-3">•</span>
                  <span className="text-blue-800">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-center"
            >
              📊 View Dashboard
            </Link>
            <Link
              to="/test/start"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-center"
            >
              🎯 Take Another Test
            </Link>
            <Link
              to={`/payment/${testResult._id}`}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-center"
            >
              🔓 Unlock Detailed Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
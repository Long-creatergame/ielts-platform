import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../Loader';

const AIPractice = lazy(() => import('../AIPractice'));
const PracticePlan = lazy(() => import('../PracticePlan'));

export default function Skills() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSkill, setActiveSkill] = useState(null);

  const skills = [
    { id: 'reading', name: 'Reading', icon: '📖', color: 'blue' },
    { id: 'listening', name: 'Listening', icon: '🎧', color: 'purple' },
    { id: 'writing', name: 'Writing', icon: '✍️', color: 'green' },
    { id: 'speaking', name: 'Speaking', icon: '🎤', color: 'orange' }
  ];

  const handleStartSkill = (skillId) => {
    navigate(`/test/start?skill=${skillId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Luyện tập kỹ năng</h1>
        <p className="text-white/90">Chọn kỹ năng bạn muốn cải thiện và bắt đầu luyện tập với AI</p>
      </div>

      {/* Skill Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200"
            onClick={() => handleStartSkill(skill.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">{skill.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{skill.name}</h3>
                  <p className="text-sm text-gray-500">IELTS {skill.name}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Bắt đầu
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              Luyện tập với bài test chuẩn Cambridge và nhận phản hồi AI chi tiết
            </p>
          </div>
        ))}
      </div>

      {/* AI Practice & Practice Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">AI Practice</h2>
          <Suspense fallback={<Loader />}>
            <AIPractice />
          </Suspense>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Practice Plan</h2>
          <Suspense fallback={<Loader />}>
            <PracticePlan />
          </Suspense>
        </div>
      </div>
    </div>
  );
}


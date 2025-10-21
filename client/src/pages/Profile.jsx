import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LevelBadge from '../components/LevelBadge';
import ProgressRing from '../components/ProgressRing';

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Please login to view profile</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">👤 Profile</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-lg font-semibold">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-lg">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Goal</label>
                  <p className="mt-1 text-lg font-semibold text-blue-600">{user.goal}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Level</label>
                  <div className="mt-1">
                    <LevelBadge level={user.currentLevel} size="lg" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-lg">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress & Statistics */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Progress & Statistics</h2>
              <div className="space-y-6">
                {/* Progress Ring */}
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Target Progress</h3>
                  <ProgressRing
                    current={user.averageBand || 0}
                    target={user.targetBand}
                    size={120}
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    Current: {user.averageBand || 'N/A'} / Target: {user.targetBand}
                  </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-blue-600">Tests Completed</p>
                    <p className="text-2xl font-bold text-blue-800">{user.totalTests || 0}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-green-600">Average Band</p>
                    <p className="text-2xl font-bold text-green-800">{user.averageBand || 'N/A'}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-purple-600">Streak Days</p>
                    <p className="text-2xl font-bold text-purple-800">{user.streakDays || 0}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-orange-600">Target Band</p>
                    <p className="text-2xl font-bold text-orange-800">{user.targetBand}</p>
                  </div>
                </div>

                {/* Goal Progress */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Goal Progress</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(((user.averageBand || 0) / user.targetBand) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {user.averageBand >= user.targetBand 
                      ? '🎉 Goal achieved!' 
                      : `${((user.targetBand - (user.averageBand || 0)).toFixed(1))} band to go`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Edit Profile
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Change Password
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
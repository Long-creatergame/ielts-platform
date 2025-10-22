import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ScoreCard from '../../components/ScoreCard';
import CoachMessage from '../../components/CoachMessage';
import ProgressRing from '../../components/ProgressRing';

export default function TestResult() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const testResult = location.state?.testResult;

  // SECURITY: Check if user is logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Please login to view test results</h1>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  // If no test result data, show fallback
  if (!testResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">No test result found</h1>
          <Link
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Generate AI feedback based on performance
  const generateAIFeedback = (overallBand, skillScores) => {
    let feedback = "";
    let recommendations = [];
    
    if (overallBand >= 8.0) {
      feedback = "🎉 Outstanding performance! You've achieved an excellent IELTS band score.";
      recommendations = [
        "Consider advanced English courses for specialized purposes",
        "You're ready for academic or professional English environments",
        "Maintain your level through regular practice and reading"
      ];
    } else if (overallBand >= 7.0) {
      feedback = "👍 Great work! You're performing well across all skills.";
      recommendations = [
        "Focus on your weakest skill to reach band 8.0",
        "Practice with more complex academic materials",
        "Work on accuracy and fluency in speaking and writing"
      ];
    } else if (overallBand >= 6.0) {
      feedback = "📈 Good progress! You're developing solid English skills.";
      recommendations = [
        "Practice more with IELTS-specific materials",
        "Focus on grammar and vocabulary expansion",
        "Work on time management during tests"
      ];
    } else {
      feedback = "💪 Keep practicing! Every step forward counts.";
      recommendations = [
        "Start with basic grammar and vocabulary building",
        "Practice daily with simple English materials",
        "Consider taking English foundation courses"
      ];
    }
    
    return { feedback, recommendations };
  };

  const { feedback, recommendations } = generateAIFeedback(testResult.overallBand, testResult.skillScores);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 IELTS Test Results
          </h1>
          <p className="text-lg text-gray-600">
            Congratulations {user?.name}! Here are your test results
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Test Level: {testResult.level} | Completed: {new Date(testResult.dateCompleted).toLocaleDateString()}
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <ProgressRing
              progress={(testResult.overallBand / 9) * 100}
              size={120}
              strokeWidth={8}
              color="#3B82F6"
            />
            <div className="ml-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Overall Band Score
              </h2>
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {testResult.overallBand}
              </div>
              <p className="text-gray-600">
                Target: Band {user?.targetBand} | Level: {testResult.level}
              </p>
            </div>
          </div>
        </div>

        {/* Individual Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ScoreCard
            skill="Reading"
            score={testResult.skillScores.reading}
            icon="📖"
            color="blue"
          />
          <ScoreCard
            skill="Listening"
            score={testResult.skillScores.listening}
            span="🎧"
            color="green"
          />
          <ScoreCard
            skill="Writing"
            score={testResult.skillScores.writing}
            icon="✍️"
            color="purple"
          />
          <ScoreCard
            skill="Speaking"
            score={testResult.skillScores.speaking}
            icon="🎤"
            color="orange"
          />
        </div>

        {/* AI Feedback and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              🤖 AI Coach Feedback
            </h3>
            <p className="text-gray-700 mb-4">{feedback}</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 font-medium">Your performance shows:</p>
              <ul className="mt-2 text-blue-700">
                <li>• Strong foundation in English skills</li>
                <li>• Good understanding of IELTS format</li>
                <li>• Room for improvement in specific areas</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              📋 Personalized Recommendations
            </h3>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Test Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📊 Test Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Test Details:</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Level: {testResult.level}</li>
                <li>• Skills Tested: Reading, Listening, Writing, Speaking</li>
                <li>• Completion Date: {new Date(testResult.dateCompleted).toLocaleDateString()}</li>
                <li>• Test ID: {testResult.id}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Performance Analysis:</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Strongest Skill: {Object.keys(testResult.skillScores).reduce((a, b) => testResult.skillScores[a] > testResult.skillScores[b] ? a : b)}</li>
                <li>• Improvement Area: {Object.keys(testResult.skillScores).reduce((a, b) => testResult.skillScores[a] < testResult.skillScores[b] ? a : b)}</li>
                <li>• Overall Progress: {testResult.overallBand >= 7.0 ? 'Advanced' : testResult.overallBand >= 6.0 ? 'Intermediate' : 'Developing'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center">
          <Link
            to="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors mr-4"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/test/start"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Take Another Test
          </Link>
        </div>
      </div>
    </div>
  );
}
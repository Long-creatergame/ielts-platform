import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';

export default function IELTSItemTest() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCurrentItem();
  }, [user]);

  const fetchCurrentItem = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/ielts-items/assign-item');
      
      if (response.data.success) {
        setCurrentItem(response.data.data.item);
        setAnswers({});
      } else {
        setError(response.data.message || 'Failed to load test item');
      }
    } catch (err) {
      console.error('Error fetching item:', err);
      setError(err.response?.data?.message || 'Failed to load test item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    if (!currentItem) return;

    try {
      setSubmitting(true);
      setError('');

      // Calculate score (simplified - in real app, this would be more sophisticated)
      const score = calculateScore(currentItem, answers);

      const response = await api.post('/ielts-items/submit', {
        ieltsItemId: currentItem._id,
        answers,
        score,
        feedback: '',
        timeSpent: 0,
        metadata: {}
      });

      if (response.data.success) {
        alert(t('test.submittedSuccessfully') || 'Test submitted successfully!');
        // Fetch new item
        await fetchCurrentItem();
      } else {
        setError(response.data.message || 'Failed to submit test');
      }
    } catch (err) {
      console.error('Error submitting:', err);
      setError(err.response?.data?.message || 'Failed to submit test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateScore = (item, userAnswers) => {
    // Simplified scoring - in production, this would be more sophisticated
    if (item.type === 'writing' || item.type === 'speaking') {
      // For writing/speaking, score would come from AI assessment
      return 6.5; // Placeholder
    }
    
    // For reading/listening, calculate based on correct answers
    if (item.content.questions) {
      const totalQuestions = item.content.questions.length;
      let correct = 0;
      
      item.content.questions.forEach((q, index) => {
        if (userAnswers[`q${index}`] === q.correctAnswer) {
          correct++;
        }
      });
      
      // Convert to band score (simplified)
      const percentage = (correct / totalQuestions) * 100;
      if (percentage >= 90) return 9.0;
      if (percentage >= 80) return 8.5;
      if (percentage >= 70) return 8.0;
      if (percentage >= 60) return 7.5;
      if (percentage >= 50) return 7.0;
      if (percentage >= 40) return 6.5;
      if (percentage >= 30) return 6.0;
      return 5.5;
    }
    
    return 6.0; // Default
  };

  const renderItemContent = () => {
    if (!currentItem) return null;

    const { type, content } = currentItem;

    switch (type) {
      case 'writing':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Writing Task 2</h3>
              <p className="text-gray-700">{content.question}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('test.yourAnswer') || 'Your Answer:'}
              </label>
              <textarea
                className="w-full h-64 p-4 border rounded-lg"
                value={answers.essay || ''}
                onChange={(e) => handleAnswerChange('essay', e.target.value)}
                placeholder={t('test.writeYourAnswer') || 'Write your answer here...'}
              />
            </div>
          </div>
        );

      case 'reading':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Reading Passage</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{content.passage}</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold">Questions:</h4>
              {content.questions?.map((q, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <p className="mb-2 font-medium">{index + 1}. {q.question}</p>
                  {q.options ? (
                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`q${index}`}
                            value={option}
                            checked={answers[`q${index}`] === option}
                            onChange={(e) => handleAnswerChange(`q${index}`, e.target.value)}
                            className="form-radio"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={answers[`q${index}`] || ''}
                      onChange={(e) => handleAnswerChange(`q${index}`, e.target.value)}
                      placeholder={t('test.enterAnswer') || 'Enter your answer'}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'listening':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Listening Test</h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('test.listenToAudio') || 'Listen to the audio and answer the questions below.'}
              </p>
              {content.audioUrl && (
                <audio controls className="w-full">
                  <source src={content.audioUrl} type="audio/mpeg" />
                </audio>
              )}
              <div className="mt-4 p-3 bg-white rounded">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{content.transcript}</p>
              </div>
            </div>
            <div className="space-y-4">
              {content.questions?.map((q, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <p className="mb-2 font-medium">{index + 1}. {q.question}</p>
                  {q.options ? (
                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`q${index}`}
                            value={option}
                            checked={answers[`q${index}`] === option}
                            onChange={(e) => handleAnswerChange(`q${index}`, e.target.value)}
                            className="form-radio"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={answers[`q${index}`] || ''}
                      onChange={(e) => handleAnswerChange(`q${index}`, e.target.value)}
                      placeholder={t('test.enterAnswer') || 'Enter your answer'}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'speaking':
        return (
          <div className="space-y-6">
            {content.part1 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Part 1: Introduction</h3>
                {content.part1.map((q, index) => (
                  <div key={index} className="mb-4">
                    <p className="mb-2 font-medium">{q.question}</p>
                    <textarea
                      className="w-full h-24 p-2 border rounded"
                      value={answers[`part1_${index}`] || ''}
                      onChange={(e) => handleAnswerChange(`part1_${index}`, e.target.value)}
                      placeholder={t('test.yourAnswer') || 'Your answer'}
                    />
                  </div>
                ))}
              </div>
            )}
            {content.part2 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Part 2: Long Turn</h3>
                <p className="mb-2 font-medium">{content.part2.cueCard}</p>
                <ul className="list-disc list-inside mb-4">
                  {content.part2.points?.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
                <textarea
                  className="w-full h-48 p-2 border rounded"
                  value={answers.part2 || ''}
                  onChange={(e) => handleAnswerChange('part2', e.target.value)}
                  placeholder={t('test.speakFor2Minutes') || 'Speak for 2 minutes about this topic...'}
                />
              </div>
            )}
            {content.part3 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Part 3: Discussion</h3>
                {content.part3.map((q, index) => (
                  <div key={index} className="mb-4">
                    <p className="mb-2 font-medium">{q.question}</p>
                    <textarea
                      className="w-full h-32 p-2 border rounded"
                      value={answers[`part3_${index}`] || ''}
                      onChange={(e) => handleAnswerChange(`part3_${index}`, e.target.value)}
                      placeholder={t('test.yourAnswer') || 'Your answer'}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return <p>{t('test.unsupportedType') || 'Unsupported test type'}</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>{t('test.loading') || 'Loading test...'}</p>
        </div>
      </div>
    );
  }

  if (error && !currentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">{error}</h2>
          <button
            onClick={fetchCurrentItem}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {t('common.retry') || 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              {currentItem?.type?.toUpperCase()} Test - {currentItem?.topic}
            </h1>
            <span className="text-sm text-gray-500">
              {currentItem?.isNew ? t('test.newItem') || 'New Item' : t('test.practiceItem') || 'Practice Item'}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              {error}
            </div>
          )}

          {renderItemContent()}

          <div className="mt-6 flex justify-between">
            <button
              onClick={fetchCurrentItem}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              disabled={submitting}
            >
              {t('test.getNewItem') || 'Get New Item'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(answers).length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? (t('test.submitting') || 'Submitting...') : (t('test.submit') || 'Submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


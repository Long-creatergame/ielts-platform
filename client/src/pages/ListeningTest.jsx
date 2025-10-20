import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ListeningTest() {
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 minutes in seconds
  const [currentSection, setCurrentSection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/api/listening/test")
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading test:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    
    try {
      const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer: answer
      }));

      const response = await fetch("http://localhost:4000/api/listening/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testType: 'academic',
          answers: answerArray,
          duration: Math.floor((40 * 60 - timeLeft) / 60)
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`🎧 Listening Test Complete!\n\nBand Score: ${result.result.bandScore}\nCorrect: ${result.result.correctCount}/${result.result.totalQuestions}\n\n${result.result.feedback}`);
        navigate('/listening/result');
      } else {
        alert('Error submitting test: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error submitting test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Listening Test...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load test data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeColor = timeLeft < 300 ? 'text-red-600' : timeLeft < 600 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-700 mb-2">🎧 {data.title}</h1>
              <p className="text-gray-600">Complete the listening test by answering all questions</p>
            </div>
            <div className={`text-right ${timeColor}`}>
              <div className="text-2xl font-bold">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
              <div className="text-sm">Time Remaining</div>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-center space-x-4">
            {data.sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentSection === section.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Section {section.id}
              </button>
            ))}
          </div>
        </div>

        {/* Current Section */}
        {data.sections.map((section) => (
          currentSection === section.id && (
            <div key={section.id} className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">{section.title}</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800">{section.instructions}</p>
              </div>

              {/* Audio Player Placeholder */}
              <div className="bg-gray-100 rounded-lg p-6 mb-6 text-center">
                <div className="text-4xl mb-2">🎵</div>
                <p className="text-gray-600 mb-4">Audio Player (Section {section.id})</p>
                <p className="text-sm text-gray-500">
                  In a real IELTS test, you would hear the audio here. For this practice test, 
                  read the questions and select the most appropriate answers.
                </p>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {Array.from({ length: section.questionCount }, (_, i) => {
                  const questionId = section.id === 1 ? i + 1 :
                                   section.id === 2 ? i + 11 :
                                   section.id === 3 ? i + 21 : i + 31;
                  
                  return (
                    <div key={questionId} className="border-b border-gray-200 pb-4">
                      <p className="font-semibold text-gray-800 mb-3">
                        {questionId}. Question {questionId} - Select the best answer:
                      </p>
                      <div className="space-y-2">
                        {['A', 'B', 'C', 'D'].map((option, index) => (
                          <label key={option} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="radio"
                              name={`question_${questionId}`}
                              value={option}
                              checked={answers[questionId] === option}
                              onChange={() => handleAnswer(questionId, option)}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="font-medium">{option}.</span>
                            <span>Answer option {index + 1}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ))}

        {/* Submit Button */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Questions answered: {Object.keys(answers).length} / 40
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

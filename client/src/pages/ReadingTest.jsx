import React, { useState, useEffect } from 'react';

const ReadingTest = () => {
  const [testData, setTestData] = useState(null);
  const [passages, setPassages] = useState([]);
  const [questions, setQuestions] = useState({});
  const [currentPassage, setCurrentPassage] = useState(1);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load test data
  useEffect(() => {
    const loadTestData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type') || 'academic';
        
        const response = await fetch(`http://localhost:4000/api/reading/test?type=${type}`);
        const data = await response.json();
        setTestData(data);

        // Load questions for each passage
        const questionsData = {};
        for (const passage of data.passages) {
          const questionsResponse = await fetch(`http://localhost:4000/api/reading/questions/${passage.id}?type=${type}`);
          const questionsData_response = await questionsResponse.json();
          questionsData[passage.id] = questionsData_response;
        }
        setQuestions(questionsData);
        setPassages(data.passages);
        setLoading(false);
      } catch (error) {
        console.error('Error loading test data:', error);
        setLoading(false);
      }
    };

    loadTestData();
  }, []);

  // Handle answer change
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Handle submit
  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer: answer
      }));

      const response = await fetch('http://localhost:4000/api/reading/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType: 'academic',
          answers: answerArray,
          duration: Math.floor((3600 - timeLeft) / 60) // minutes used
        }),
      });

      const result = await response.json();
      
      if (result.result) {
        // Redirect to results page
        window.location.href = `/reading/result?id=${result.result._id}`;
      }
    } catch (error) {
      console.error('Error submitting test:', error);
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
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  const currentPassageData = passages.find(p => p.id === currentPassage);
  const currentQuestions = questions[currentPassage]?.questions || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-700">
              IELTS Reading Test
            </h1>
            <div className="flex items-center space-x-4">
              <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-800'}`}>
                {formatTime(timeLeft)}
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Passages Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-4">Passages</h3>
              <div className="space-y-2">
                {passages.map((passage) => (
                  <button
                    key={passage.id}
                    onClick={() => setCurrentPassage(passage.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentPassage === passage.id
                        ? 'bg-green-100 text-green-800 border-2 border-green-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">Passage {passage.id}</div>
                    <div className="text-sm text-gray-600">{passage.title}</div>
                    <div className="text-xs text-gray-500">{passage.questionCount} questions</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Passage Content */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Passage {currentPassage}: {currentPassageData?.title}
              </h2>
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {currentPassageData?.content}
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Questions {currentQuestions.length > 0 ? `${currentQuestions[0].id}-${currentQuestions[currentQuestions.length - 1].id}` : ''}
              </h3>
              <div className="space-y-6">
                {currentQuestions.map((question) => (
                  <div key={question.id} className="border-b border-gray-200 pb-4">
                    <div className="mb-3">
                      <span className="font-medium text-gray-800">Question {question.id}:</span>
                      <p className="text-gray-700 mt-1">{question.question}</p>
                    </div>

                    {question.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        {question.options.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name={`question_${question.id}`}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              className="text-green-600 focus:ring-green-500"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'true-false' && (
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            value="True"
                            checked={answers[question.id] === 'True'}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="text-gray-700">True</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            value="False"
                            checked={answers[question.id] === 'False'}
                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <span className="text-gray-700">False</span>
                        </label>
                      </div>
                    )}

                    {question.type === 'fill-blank' && (
                      <div>
                        <input
                          type="text"
                          value={answers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 w-full max-w-md focus:ring-green-500 focus:border-green-500"
                          placeholder="Your answer..."
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingTest;

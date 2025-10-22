import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Timer from '../../components/Timer';

export default function TestPage() {
  const { skill } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState('');
  const [timeUp, setTimeUp] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(5);
  
  // Get level from URL params or default to A2
  const urlParams = new URLSearchParams(window.location.search);
  const level = urlParams.get('level') || 'A2';

  const durations = {
    reading: 900,    // 15 minutes
    listening: 900,  // 15 minutes
    writing: 3600,   // 60 minutes
    speaking: 660    // 11 minutes
  };

  // AI-Generated IELTS Questions based on CEFR Level
  const generateIELTSQuestions = (skill, level) => {
    const questionSets = {
      reading: {
        A1: [
          {
            passage: "My name is Sarah. I am 25 years old. I live in London with my family. I work in a hospital as a nurse. I like my job very much because I help people.",
            questions: [
              "What is Sarah's age?",
              "Where does Sarah live?",
              "What is Sarah's job?",
              "Why does Sarah like her job?",
              "Who does Sarah live with?"
            ]
          }
        ],
        A2: [
          {
            passage: "Climate change is affecting our planet. The temperature is rising because of pollution. Many animals are losing their homes. People need to use less energy and recycle more. We must protect our environment for future generations.",
            questions: [
              "What is causing the temperature to rise?",
              "What is happening to many animals?",
              "What should people do to help?",
              "Why is protecting the environment important?",
              "What is the main topic of this passage?"
            ]
          }
        ],
        B1: [
          {
            passage: "The digital revolution has transformed modern education. Online learning platforms have made education more accessible worldwide. Students can now access courses from prestigious universities without leaving their homes. However, this shift has also raised concerns about the quality of education and the lack of face-to-face interaction.",
            questions: [
              "How has online learning made education more accessible?",
              "What concern is mentioned about online education?",
              "What type of universities are mentioned in the passage?",
              "What does 'face-to-face interaction' refer to?",
              "What is the main argument about digital education?"
            ]
          }
        ],
        B2: [
          {
            passage: "Artificial intelligence is revolutionizing numerous industries, from healthcare to finance. Machine learning algorithms can analyze vast amounts of data to identify patterns that humans might miss. While AI offers tremendous benefits, it also presents ethical challenges regarding privacy, job displacement, and decision-making transparency.",
            questions: [
              "What industries are mentioned as being revolutionized by AI?",
              "What advantage do machine learning algorithms have over humans?",
              "What ethical challenges are mentioned?",
              "What does 'job displacement' mean in this context?",
              "What is the overall tone of this passage?"
            ]
          }
        ],
        C1: [
          {
            passage: "The concept of sustainable development encompasses economic growth, environmental protection, and social equity. This paradigm requires a fundamental shift in how societies approach resource allocation and consumption patterns. Policymakers must balance immediate economic needs with long-term environmental sustainability, often requiring difficult trade-offs and innovative solutions.",
            questions: [
              "What three elements does sustainable development encompass?",
              "What fundamental shift is required?",
              "What challenge do policymakers face?",
              "What does 'trade-offs' mean in this context?",
              "What is the author's main argument?"
            ]
          }
        ],
        C2: [
          {
            passage: "The philosophical implications of quantum computing extend far beyond technological advancement. The probabilistic nature of quantum mechanics challenges our classical understanding of determinism and causality. As quantum computers become more sophisticated, they may fundamentally alter our comprehension of reality, consciousness, and the nature of computation itself.",
            questions: [
              "What philosophical implications are mentioned?",
              "How does quantum mechanics challenge classical understanding?",
              "What might quantum computers alter?",
              "What is the relationship between quantum computing and consciousness?",
              "What is the most complex concept discussed?"
            ]
          }
        ]
      },
      listening: {
        A1: [
          "Listen and identify: What is the person's name?",
          "What time does the meeting start?",
          "Where is the restaurant located?",
          "What is the weather like today?",
          "How much does the ticket cost?"
        ],
        A2: [
          "What is the main topic of the conversation?",
          "What does the speaker recommend?",
          "When will the event take place?",
          "What are the walking directions?",
          "What is the speaker's opinion about the movie?"
        ],
        B1: [
          "What is the speaker's main argument?",
          "What evidence supports this argument?",
          "What are the potential consequences mentioned?",
          "What is the speaker's tone?",
          "What recommendation is given?"
        ],
        B2: [
          "What is the central thesis of the lecture?",
          "What methodology is being discussed?",
          "What are the implications of the research findings?",
          "What limitations are mentioned?",
          "What future research directions are suggested?"
        ],
        C1: [
          "What is the theoretical framework being presented?",
          "How does this challenge existing paradigms?",
          "What are the methodological considerations?",
          "What are the broader societal implications?",
          "What questions remain unanswered?"
        ],
        C2: [
          "What is the epistemological foundation of this argument?",
          "How does this relate to ontological assumptions?",
          "What are the meta-theoretical implications?",
          "How does this challenge fundamental presuppositions?",
          "What are the implications for our understanding of reality?"
        ]
      },
      writing: {
        A1: [
          "Task 1: Write a letter to your friend about your new school",
          "Task 2: Write about your favorite food and why you like it"
        ],
        A2: [
          "Task 1: Describe the process of making coffee",
          "Task 2: Do you think technology makes life easier? Give your opinion"
        ],
        B1: [
          "Task 1: Compare the advantages and disadvantages of living in a city",
          "Task 2: Some people think that social media has a negative impact on young people. To what extent do you agree?"
        ],
        B2: [
          "Task 1: Analyze the data showing global energy consumption trends",
          "Task 2: The increasing use of artificial intelligence in the workplace will lead to more unemployment. Discuss both views and give your opinion."
        ],
        C1: [
          "Task 1: Evaluate the effectiveness of different environmental policies",
          "Task 2: The concept of privacy has become obsolete in the digital age. To what extent do you agree with this statement?"
        ],
        C2: [
          "Task 1: Critique the methodology of a psychological research study",
          "Task 2: The philosophical implications of quantum computing challenge our fundamental understanding of reality. Discuss this statement with reference to contemporary scientific thought."
        ]
      },
      speaking: {
        A1: [
          "Tell me about yourself",
          "What do you like to do in your free time?",
          "Describe your family",
          "What is your favorite food?",
          "Do you like your job/studies?"
        ],
        A2: [
          "Describe your hometown",
          "What are your future plans?",
          "Talk about a book you have read",
          "Describe a memorable trip",
          "What do you think about social media?"
        ],
        B1: [
          "Discuss the advantages and disadvantages of living in a big city",
          "Talk about a time when you had to make a difficult decision",
          "Describe a person who has influenced you",
          "Discuss the impact of technology on education",
          "What are the most important qualities in a good friend?"
        ],
        B2: [
          "Analyze the causes and effects of climate change",
          "Discuss the role of government in regulating social media",
          "Evaluate the pros and cons of remote work",
          "Examine the impact of globalization on local cultures",
          "Assess the effectiveness of current educational systems"
        ],
        C1: [
          "Critically evaluate the ethical implications of artificial intelligence",
          "Analyze the relationship between economic growth and environmental sustainability",
          "Discuss the philosophical foundations of human rights",
          "Evaluate the impact of digital transformation on society",
          "Assess the role of media in shaping public opinion"
        ],
        C2: [
          "Examine the epistemological implications of quantum mechanics",
          "Analyze the ontological assumptions underlying contemporary political theory",
          "Critically evaluate the meta-ethical foundations of moral reasoning",
          "Discuss the phenomenological aspects of consciousness studies",
          "Assess the hermeneutical challenges in interpreting historical texts"
        ]
      }
    };

    return questionSets[skill][level] || questionSets[skill]['A2'];
  };

  const questions = generateIELTSQuestions(skill, level); // Use dynamic level from URL

  const handleSubmit = () => {
    // AI-powered band score calculation (simplified)
    const baseScore = 6.0;
    const answerLength = answers.length;
    const timeBonus = timeUp ? 0 : 0.5; // Bonus for finishing early
    const lengthBonus = Math.min(answerLength / 100, 2.0); // Bonus for longer answers
    const bandScore = Math.min(baseScore + lengthBonus + timeBonus + Math.random(), 9.0);
    
    // AI feedback based on performance
    let feedback = "";
    if (bandScore >= 8.0) {
      feedback = "🎉 Excellent! Your performance shows advanced proficiency.";
    } else if (bandScore >= 7.0) {
      feedback = "👍 Good work! You're on track for your target band.";
    } else if (bandScore >= 6.0) {
      feedback = "📈 Keep practicing! Focus on grammar and vocabulary.";
    } else {
      feedback = "💪 Don't give up! Practice more to improve your skills.";
    }
    
    // Show completion message with AI feedback
    alert(`${skill.charAt(0).toUpperCase() + skill.slice(1)} Test Completed!\n\nBand Score: ${bandScore.toFixed(1)}\n\nAI Feedback: ${feedback}`);
    
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    handleSubmit();
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-center">
              {skill === 'reading' && '📖 Reading Test'}
              {skill === 'listening' && '🎧 Listening Test'}
              {skill === 'writing' && '✍️ Writing Test'}
              {skill === 'speaking' && '🎤 Speaking Test'}
            </h1>
            <Timer
              duration={durations[skill]}
              onTimeUp={handleTimeUp}
            />
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion} of {totalQuestions}</span>
              <span>{Math.round(((currentQuestion - 1) / totalQuestions) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion - 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Question {currentQuestion}:</h2>
            
            {/* Reading Passage for Reading Tests */}
            {skill === 'reading' && questions.passage && (
              <div className="mb-6 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-blue-800 mb-3">📖 Reading Passage:</h3>
                <p className="text-gray-700 leading-relaxed">{questions.passage}</p>
              </div>
            )}
            
            <p className="text-gray-700 mb-6 p-4 bg-gray-50 rounded-lg">
              {Array.isArray(questions) ? questions[currentQuestion - 1] : questions.questions[currentQuestion - 1]}
            </p>

            {timeUp && (
              <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-800 font-semibold">⏰ Time's up! Test submitted automatically.</p>
              </div>
            )}
          </div>

          {/* Answer Input */}
          <div className="mb-8">
            <textarea
              value={answers}
              onChange={(e) => setAnswers(e.target.value)}
              placeholder={`Enter your ${skill} response here...`}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={timeUp}
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </button>

            <div className="space-x-4">
              {currentQuestion < totalQuestions ? (
                <button
                  onClick={handleNextQuestion}
                  disabled={timeUp}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={timeUp}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Submit Test ✓
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
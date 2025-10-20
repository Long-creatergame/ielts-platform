import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const TestPage = () => {
  const { skill } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [canStart, setCanStart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [isAiScoring, setIsAiScoring] = useState(false)

  useEffect(() => {
    checkCanStart()
  }, [])

  const checkCanStart = async () => {
    try {
      const response = await axios.get('/api/test/can-start')
      setCanStart(response.data.allowed)
    } catch (error) {
      console.error('Error checking if can start test:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitMessage('')

    try {
      // First submit the test to mark trial as used
      await axios.post('/api/test/submit', { skill })
      
      // If it's Writing or Speaking, also submit for AI scoring
      if (['writing', 'speaking'].includes(skill.toLowerCase()) && userAnswer.trim()) {
        setIsAiScoring(true)
        setSubmitMessage('Test submitted! AI is now scoring your response...')
        
        try {
          const aiResponse = await axios.post('/api/ai/score', { 
            skill: skill.toLowerCase(), 
            answer: userAnswer 
          })
          
          setSubmitMessage(`AI scoring completed! Your band score: ${aiResponse.data.score.overall}`)
          
          // Redirect to results page after 3 seconds
          setTimeout(() => {
            navigate('/result')
          }, 3000)
        } catch (aiError) {
          console.error('AI scoring error:', aiError)
          setSubmitMessage('Test submitted successfully! AI scoring failed, but your test is recorded.')
          
          setTimeout(() => {
            navigate('/dashboard')
          }, 3000)
        } finally {
          setIsAiScoring(false)
        }
      } else {
        setSubmitMessage('Test submitted successfully!')
        
        setTimeout(() => {
          navigate('/dashboard')
        }, 3000)
      }
    } catch (error) {
      setSubmitMessage(error.response?.data?.error || 'Failed to submit test')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                {skill} Test
              </h1>
              <p className="text-gray-600">IELTS Platform</p>
            </div>
            <button
              onClick={handleBackToDashboard}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {!canStart ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">
                    <strong>Cannot start test:</strong>
                    {user.plan === 'trial' && user.isTrialUsed 
                      ? ' You have already used your trial test. Please upgrade to a paid plan for unlimited access.'
                      : ' You do not have permission to start this test.'
                    }
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleBackToDashboard}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Welcome to the {skill} test!
                  </h2>
                  <p className="text-gray-600">
                    This is a demo test page. In a real implementation, you would have the actual test content here.
                  </p>
                </div>

                {/* Demo Test Content */}
                <div className="border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Demo Test Content for {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  </h3>
                  
                  {skill === 'listening' && (
                    <div>
                      <p className="text-gray-700 mb-4">
                        Listen to the audio and answer the questions below.
                      </p>
                      <div className="bg-gray-100 p-4 rounded-md mb-4">
                        <p className="text-center text-gray-600">🎵 Audio Player would be here</p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question 1: What is the main topic discussed?
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your answer..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question 2: According to the speaker, what is the most important factor?
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your answer..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {skill === 'reading' && (
                    <div>
                      <p className="text-gray-700 mb-4">
                        Read the following passage and answer the questions.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-md mb-4 border">
                        <p className="text-gray-800 leading-relaxed">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat...
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question 1: What is the main idea of the passage?
                          </label>
                          <textarea
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your answer..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  )}

                  {skill === 'writing' && (
                    <div>
                      <p className="text-gray-700 mb-4">
                        Write your response to the following task.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-md mb-4 border">
                        <p className="text-gray-800">
                          <strong>Task:</strong> Write about the advantages and disadvantages of living in a big city. 
                          Write at least 250 words.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Response:
                        </label>
                        <textarea
                          rows="10"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Write your essay here... (150-250 words recommended)"
                        ></textarea>
                        <div className="text-sm text-gray-500 mt-1">
                          Word count: {userAnswer.split(' ').filter(word => word.length > 0).length}
                        </div>
                      </div>
                    </div>
                  )}

                  {skill === 'speaking' && (
                    <div>
                      <p className="text-gray-700 mb-4">
                        Answer the following questions as if you were in a speaking test.
                      </p>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-md border">
                          <p className="text-gray-800 mb-2">
                            <strong>Part 1:</strong> Tell me about your hometown.
                          </p>
                          <textarea
                            rows="3"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Type your spoken response here... (This is a demo - in real IELTS you would speak)"
                          />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md border">
                          <p className="text-gray-800 mb-2">
                            <strong>Part 2:</strong> Describe a memorable trip you have taken.
                          </p>
                          <textarea
                            rows="4"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Continue your response here..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Ready to submit your {skill} test?
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || isAiScoring}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md text-sm font-medium"
                    >
                      {isAiScoring ? 'AI Scoring...' : submitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                  </div>
                  
                  {submitMessage && (
                    <div className={`mt-4 p-4 rounded-md ${
                      submitMessage.includes('successfully') 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {submitMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default TestPage

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import ProgressChart from '../components/ProgressChart'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [canStartTest, setCanStartTest] = useState(false)
  const [userTests, setUserTests] = useState([])
  const [aiTestResults, setAiTestResults] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [canStartResponse, testsResponse, aiResultsResponse] = await Promise.all([
        axios.get('/api/test/can-start'),
        axios.get('/api/test/mine'),
        axios.get('/api/ai/results')
      ])
      
      setCanStartTest(canStartResponse.data.allowed)
      setUserTests(testsResponse.data.tests)
      
      const aiResults = aiResultsResponse.data.tests || []
      setAiTestResults(aiResults)
      
      // Prepare chart data
      const chartData = prepareChartData(aiResults)
      setChartData(chartData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleStartTest = (skill) => {
    navigate(`/test/${skill}`)
  }

  const payNow = async () => {
    try {
      const response = await axios.post('/api/payment/create-session')
      window.location.href = response.data.url
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    }
  }

  const getPlanColor = (plan) => {
    return plan === 'paid' ? 'text-green-600' : 'text-yellow-600'
  }

  const getTrialStatus = () => {
    if (user.plan === 'paid') return 'Paid Plan - Unlimited Tests'
    return user.isTrialUsed ? 'Trial Used' : 'Trial Available'
  }

  // Prepare chart data for IELTS progress
  const prepareChartData = (aiResults) => {
    if (!aiResults || aiResults.length === 0) return []
    
    // Sort by date and group by date
    const sortedTests = aiResults.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
    
    // Group tests by date
    const groupedByDate = sortedTests.reduce((acc, test) => {
      const date = new Date(test.submittedAt).toLocaleDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(test)
      return acc
    }, {})
    
    // Create chart data with overall and writing scores
    return Object.entries(groupedByDate).map(([date, tests]) => {
      const overallScore = tests.reduce((sum, test) => sum + test.score.overall, 0) / tests.length
      const writingTest = tests.find(test => test.skill === 'writing')
      const writingScore = writingTest ? writingTest.score.overall : null
      
      return {
        date: date,
        overall: Number(overallScore.toFixed(1)),
        writing: writingScore ? Number(writingScore.toFixed(1)) : null
      }
    })
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
              <h1 className="text-3xl font-bold text-gray-900">IELTS Platform</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/result')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                View Results
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">P</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Plan</dt>
                      <dd className={`text-lg font-medium ${getPlanColor(user.plan)}`}>
                        {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">T</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Trial Status</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {getTrialStatus()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">#</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Tests Taken</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {userTests.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{backgroundColor: '#35b86d'}}>
                      <span className="text-white text-sm font-medium">AI</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">AI Tests</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {aiTestResults.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reading Analytics Card */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                📊 Reading Analytics
              </h3>
              <p className="text-gray-600 mb-4">
                Track your reading test progress and performance over time
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/reading/analytics')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  View Analytics
                </button>
                <button
                  onClick={() => navigate('/reading/history')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  View History
                </button>
                <button
                  onClick={() => navigate('/reading/select')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Take Reading Test
                </button>
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Available Tests
              </h3>
              
              {!canStartTest ? (
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="text-sm text-yellow-700 mb-4">
                    {user.plan === 'trial' && user.isTrialUsed 
                      ? 'You have used your trial test. Upgrade to a paid plan for unlimited access.'
                      : 'You cannot start a test at this time.'
                    }
                  </div>
                  {user.plan === 'trial' && user.isTrialUsed && (
                    <button
                      onClick={payNow}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium"
                    >
                      Thanh toán $9.99 để mở khóa
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['listening', 'reading', 'writing', 'speaking'].map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleStartTest(skill)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-sm font-medium capitalize"
                    >
                      {skill} Test
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* IELTS Progress Chart */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                IELTS Progress
              </h3>
              
              <ProgressChart data={chartData} />
            </div>
          </div>

          {/* Test History */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Test History
              </h3>
              
              {userTests.length === 0 && aiTestResults.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No tests taken yet</div>
                  <div className="text-sm text-gray-400 mt-1">Start your first test to see it here</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* AI Test Results */}
                  {aiTestResults.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">AI-Scored Tests</h4>
                      <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Skill
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Overall Score
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date Taken
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {aiTestResults.slice(0, 5).map((test, index) => (
                              <tr key={`ai-${index}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                  {test.skill}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Band {test.score.overall}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(test.submittedAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Regular Test History */}
                  {userTests.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">All Tests</h4>
                      <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Skill
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date Taken
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {userTests.slice(0, 10).map((test, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                  {test.skill}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(test.submittedAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

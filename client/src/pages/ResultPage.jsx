import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const ResultPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [testResults, setTestResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState('all')

  useEffect(() => {
    fetchTestResults()
  }, [])

  const fetchTestResults = async () => {
    try {
      const response = await axios.get('/api/ai/results')
      setTestResults(response.data.tests)
    } catch (error) {
      console.error('Error fetching test results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const downloadCertificate = async (testId) => {
    try {
      const response = await axios.get(`/api/certificate/${testId}/pdf`, {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `IELTS_TRF_${testId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      alert('🎓 Chứng chỉ PDF đã được tải xuống thành công!')
    } catch (error) {
      console.error('Certificate download error:', error)
      alert('❌ Lỗi khi tạo PDF: ' + (error.response?.data?.error || error.message))
    }
  }

  const filteredResults = selectedSkill === 'all' 
    ? testResults 
    : testResults.filter(test => test.skill === selectedSkill)

  // Prepare data for chart
  const chartData = filteredResults
    .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
    .map((test, index) => ({
      test: `Test ${index + 1}`,
      overall: test.score.overall,
      task: test.score.task,
      coherence: test.score.coherence,
      lexical: test.score.lexical,
      grammar: test.score.grammar,
      date: new Date(test.submittedAt).toLocaleDateString()
    }))

  const getBandColor = (score) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6.5) return 'text-blue-600'
    if (score >= 5.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBandBgColor = (score) => {
    if (score >= 8) return 'bg-green-100'
    if (score >= 6.5) return 'bg-blue-100'
    if (score >= 5.5) return 'bg-yellow-100'
    return 'bg-red-100'
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
              <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
              <p className="text-gray-600">AI-powered IELTS scoring and progress tracking</p>
            </div>
            <button
              onClick={handleBackToDashboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Skill:
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Skills</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
            </select>
          </div>

          {testResults.length === 0 ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-2">No test results yet</div>
                  <div className="text-sm text-gray-400 mb-4">
                    Complete Writing or Speaking tests to see your AI-scored results here
                  </div>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Take a Test
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Chart */}
              <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Progress Chart
                  </h3>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="test" />
                        <YAxis domain={[0, 9]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="overall" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          name="Overall Band"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="task" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          name="Task Response"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="coherence" 
                          stroke="#F59E0B" 
                          strokeWidth={2}
                          name="Coherence & Cohesion"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="lexical" 
                          stroke="#EF4444" 
                          strokeWidth={2}
                          name="Lexical Resource"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="grammar" 
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          name="Grammar Range & Accuracy"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Complete more tests to see progress chart
                    </div>
                  )}
                </div>
              </div>

              {/* Test Results List */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Test Results ({filteredResults.length})
                  </h3>
                  
                  <div className="space-y-6">
                    {filteredResults.map((test, index) => (
                      <div key={test.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 capitalize">
                              {test.skill} Test #{filteredResults.length - index}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(test.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getBandBgColor(test.score.overall)} ${getBandColor(test.score.overall)}`}>
                            Band {test.score.overall}
                          </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{test.score.overall}</div>
                            <div className="text-xs text-gray-500">Overall</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-semibold text-green-600">{test.score.task}</div>
                            <div className="text-xs text-gray-500">
                              {test.skill === 'writing' ? 'Task Response' : 'Fluency'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-semibold text-yellow-600">{test.score.coherence}</div>
                            <div className="text-xs text-gray-500">Coherence</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-semibold text-red-600">{test.score.lexical}</div>
                            <div className="text-xs text-gray-500">Lexical</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-semibold text-purple-600">{test.score.grammar}</div>
                            <div className="text-xs text-gray-500">Grammar</div>
                          </div>
                        </div>

                        {/* AI Feedback */}
                        <div className="bg-gray-50 rounded-md p-4 mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">AI Feedback:</h5>
                          <p className="text-sm text-gray-700">{test.feedback}</p>
                        </div>

                        {/* Certificate Download */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => downloadCertificate(test.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
                          >
                            <span>📄</span>
                            <span>Xuất chứng chỉ PDF</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default ResultPage
